# ✂ Barbearia SaaS

Sistema de agendamento online multi-tenant para barbearias em Portugal.

## Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Backend**: Supabase (Postgres + Auth + RLS + Realtime)
- **Pagamentos**: Stripe (Checkout + Webhooks + Billing Portal)
- **Notificações**: Resend (email) + CallMeBot (WhatsApp grátis)
- **Deploy**: Vercel

## Estrutura

```
barbearia-saas/
├── app/
│   ├── page.tsx              ← Landing page SaaS
│   ├── auth/page.tsx         ← Login / Registo
│   ├── dashboard/page.tsx    ← Painel do dono
│   ├── admin/page.tsx        ← Painel admin plataforma
│   ├── [slug]/page.tsx       ← Página pública de marcação
│   └── api/
│       ├── stripe/route.ts       ← Checkout + Portal
│       ├── booking/route.ts      ← Notificações pós-booking
│       └── webhooks/stripe/route.ts ← Webhook Stripe
├── components/
│   ├── booking/BookingFlow.tsx    ← Fluxo 4 passos
│   ├── dashboard/DashboardClient.tsx ← Dashboard dono
│   ├── settings/SettingsPanel.tsx  ← Configurações
│   └── admin/AdminPanel.tsx       ← Admin plataforma
├── lib/
│   ├── supabase.ts           ← Clientes Supabase
│   ├── supabase-server.ts    ← Server client
│   ├── types.ts              ← TypeScript types
│   ├── queries.ts            ← Todas as queries
│   ├── stripe.ts             ← Stripe helpers
│   ├── notifications.ts      ← Email + WhatsApp
│   └── constants.ts          ← Constantes + helpers
├── middleware.ts              ← Protecção de rotas
└── supabase-schema.sql       ← Schema SQL completo
```

## Setup (passo a passo)

### 1. Supabase

1. Criar projeto em [supabase.com](https://supabase.com)
2. Ir a **SQL Editor** → colar o conteúdo de `supabase-schema.sql` → **Run**
3. Copiar Project URL e Anon Key para `.env.local`
4. Em **Settings > API**, copiar o Service Role Key
5. Em **Auth > Settings**, ativar Email confirmations (ou desativar para dev)
6. Em **Database > Extensions**, ativar `pg_cron` se quiser expirar trials automaticamente

### 2. Stripe

1. Criar conta em [stripe.com](https://stripe.com)
2. Criar 3 Produtos com preços recorrentes (Basic 19€, Pro 39€, Enterprise 79€)
3. Copiar os Price IDs para `.env.local`
4. Em **Developers > Webhooks**, criar endpoint apontando para:
   `https://SEU-DOMINIO/api/webhooks/stripe`
5. Eventos: `checkout.session.completed`, `customer.subscription.updated`,
   `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`
6. Copiar o Webhook Secret para `.env.local`

### 3. Resend (email)

1. Criar conta em [resend.com](https://resend.com) (100 emails/dia grátis)
2. Verificar domínio ou usar o email de teste
3. Copiar API Key para `.env.local`

### 4. CallMeBot (WhatsApp grátis)

1. Ir a [callmebot.com/blog/free-api-whatsapp-messages](https://www.callmebot.com/blog/free-api-whatsapp-messages/)
2. Enviar `I allow callmebot to send me messages` para o +34 644 51 84 88
3. Copiar o API Key recebido para `.env.local`

### 5. Instalar e correr

```bash
cp .env.local.example .env.local
# Preencher todas as variáveis

npm install
npm run dev
```

### 6. Criar admin

Após o primeiro registo, ir ao Supabase SQL Editor e correr:

```sql
UPDATE profiles SET role = 'platform_admin' WHERE email = 'teu-email@gmail.com';
```

### 7. Deploy (Vercel)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Adicionar variáveis de ambiente no Vercel Dashboard
# Settings > Environment Variables > colar tudo do .env.local
```

## Fluxos

1. **Dono regista-se** → cria conta + salão automático (14 dias trial)
2. **Dono configura** → serviços, equipa, horários, publica
3. **Cliente acede** → `app.com/slug` → marca sem login
4. **Dono recebe** → notificação email/WhatsApp + aparece no dashboard
5. **Trial expira** → dono escolhe plano → Stripe Checkout → ativa
6. **Admin** → vê todos os salões, métricas, receita
