// ══════════════════════════════════════════
// app/api/webhooks/stripe/route.ts — Stripe webhook
// ══════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { constructWebhookEvent } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event
  try {
    event = constructWebhookEvent(body, signature)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as unknown as Record<string, unknown>
        const metadata = (session.metadata || {}) as Record<string, string>
        const salonId = metadata.salon_id
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string
        const plan = metadata.plan || 'basic'

        if (salonId) {
          await supabase.from('salons').update({
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            plan: plan as 'basic' | 'pro' | 'enterprise',
            plan_status: 'active',
            is_active: true,
          }).eq('id', salonId)
        }
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as unknown as Record<string, unknown>
        const customerId = sub.customer as string
        const status = sub.status as string

        const planStatus = status === 'active' ? 'active'
          : status === 'past_due' ? 'past_due'
          : status === 'canceled' ? 'cancelled'
          : 'active'

        await supabase.from('salons').update({
          plan_status: planStatus,
          is_active: planStatus === 'active',
        }).eq('stripe_customer_id', customerId)
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as unknown as Record<string, unknown>
        const customerId = sub.customer as string

        await supabase.from('salons').update({
          plan_status: 'cancelled',
          is_active: false,
        }).eq('stripe_customer_id', customerId)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as unknown as Record<string, unknown>
        const customerId = invoice.customer as string
        const amount = (invoice.amount_paid as number) / 100

        const { data: salon } = await supabase
          .from('salons')
          .select('id, plan')
          .eq('stripe_customer_id', customerId)
          .single()

        if (salon) {
          await supabase.from('payment_history').insert({
            salon_id: salon.id,
            stripe_payment_id: invoice.payment_intent as string,
            stripe_invoice_id: invoice.id as string,
            amount,
            status: 'succeeded',
            plan: salon.plan,
            period_start: new Date((invoice.period_start as number) * 1000).toISOString(),
            period_end: new Date((invoice.period_end as number) * 1000).toISOString(),
          })
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as unknown as Record<string, unknown>
        const customerId = invoice.customer as string

        await supabase.from('salons').update({
          plan_status: 'past_due',
        }).eq('stripe_customer_id', customerId)

        const { data: salon } = await supabase
          .from('salons')
          .select('id, plan')
          .eq('stripe_customer_id', customerId)
          .single()

        if (salon) {
          await supabase.from('payment_history').insert({
            salon_id: salon.id,
            stripe_payment_id: invoice.payment_intent as string || '',
            stripe_invoice_id: invoice.id as string,
            amount: ((invoice.amount_due as number) || 0) / 100,
            status: 'failed',
            plan: salon.plan,
          })
        }
        break
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
