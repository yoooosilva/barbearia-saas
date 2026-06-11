// ══════════════════════════════════════════
// lib/stripe.ts — Stripe (pagamentos)
// ══════════════════════════════════════════

import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

// Mapeamento plano → preço Stripe (apenas Pro, Basic é grátis)
// Price ID live: Barbearia SaaS Pro — €19/mês
const PLAN_PRICES: Record<string, string> = {
  pro: process.env.STRIPE_PRICE_PRO || 'price_1TcG11DBLiWzZP08Xg6rJwhq',
}

// Criar sessão de Checkout (redirect para Stripe)
export async function createCheckoutSession(params: {
  salonId: string
  salonName: string
  ownerEmail: string
  plan: string
  stripeCustomerId?: string | null
}) {
  const priceId = PLAN_PRICES[params.plan]
  if (!priceId) throw new Error(`Plano inválido: ${params.plan}`)

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: params.stripeCustomerId ? undefined : params.ownerEmail,
    customer: params.stripeCustomerId || undefined,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { salon_id: params.salonId, plan: params.plan },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=cancelled`,
    subscription_data: {
      metadata: { salon_id: params.salonId },
    },
  })

  return session
}

// Portal do cliente (gerir subscrição, cancelar, trocar cartão)
export async function createBillingPortal(customerId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  })
  return session
}

// Processar eventos de webhook
export function constructWebhookEvent(body: string, signature: string) {
  return stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
}
