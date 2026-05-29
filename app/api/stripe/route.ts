// ══════════════════════════════════════════
// app/api/stripe/route.ts — Checkout + Billing Portal
// ══════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { createCheckoutSession, createBillingPortal } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const body = await request.json()
    const { action, plan } = body

    // Buscar salão do user
    const { data: salon } = await supabase
      .from('salons')
      .select('*')
      .eq('owner_id', user.id)
      .single()

    if (!salon) return NextResponse.json({ error: 'Salon not found' }, { status: 404 })

    if (action === 'checkout') {
      // Criar sessão de checkout
      const session = await createCheckoutSession({
        salonId: salon.id,
        salonName: salon.name,
        ownerEmail: user.email!,
        plan: plan || 'basic',
        stripeCustomerId: salon.stripe_customer_id,
      })
      return NextResponse.json({ url: session.url })
    }

    if (action === 'portal') {
      // Abrir portal de billing
      if (!salon.stripe_customer_id) {
        return NextResponse.json({ error: 'No Stripe customer' }, { status: 400 })
      }
      const session = await createBillingPortal(salon.stripe_customer_id)
      return NextResponse.json({ url: session.url })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    console.error('Stripe API error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
