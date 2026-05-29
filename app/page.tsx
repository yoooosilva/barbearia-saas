// ══════════════════════════════════════════
// app/page.tsx — Landing page da plataforma SaaS
// ══════════════════════════════════════════

import Link from 'next/link'
import { PLANS, CUR } from '@/lib/constants'

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at 50% 0%, #1A1520 0%, #0A090D 60%)' }}>
      {/* Hero */}
      <div className="max-w-4xl mx-auto text-center px-6 pt-24 pb-16 animate-fadeUp">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border border-[var(--accent)]/40 mb-8 animate-glow animate-float">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
            <line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/>
            <line x1="8.12" y1="8.12" x2="12" y2="12"/>
          </svg>
        </div>

        <h1 className="text-5xl md:text-6xl font-light mb-4 tracking-wider" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text)' }}>
          A sua barbearia,<br/>
          <span style={{ color: 'var(--accent)' }}>sempre cheia</span>
        </h1>

        <p className="text-lg mb-10 max-w-2xl mx-auto" style={{ color: 'var(--muted)' }}>
          Sistema de agendamento online para barbearias em Portugal.
          Os seus clientes marcam sozinhos, 24/7. Você foca-se no que faz melhor.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth?mode=signup" className="px-8 py-4 rounded-xl text-base font-semibold uppercase tracking-widest transition-transform hover:-translate-y-0.5"
            style={{ background: 'var(--accent)', color: 'var(--bg)', boxShadow: '0 4px 24px rgba(212,168,83,0.4)' }}>
            Experimentar Grátis — 14 dias
          </Link>
          <Link href="/auth" className="px-8 py-4 rounded-xl text-base font-medium uppercase tracking-widest border transition-all hover:bg-[var(--accent)]/10"
            style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
            Entrar
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8">
        {[
          { icon: '📱', title: 'Link público', desc: 'Os clientes acedem via link e marcam sem criar conta. Partilhe no Instagram, WhatsApp ou cartão de visita.' },
          { icon: '📊', title: 'Dashboard completo', desc: 'Faturação diária, semanal e mensal. Top serviços, clientes assíduos, relatórios PDF.' },
          { icon: '🔔', title: 'Notificações', desc: 'Receba alertas por email e WhatsApp quando um cliente marca, cancela ou falta.' },
        ].map((f, i) => (
          <div key={i} className="rounded-xl p-6 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text)' }}>{f.title}</h3>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Pricing */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-light text-center mb-12" style={{ fontFamily: "'Playfair Display', serif" }}>Planos</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {Object.entries(PLANS).map(([key, plan]) => (
            <div key={key} className="rounded-xl p-6 border relative" style={{
              background: key === 'pro' ? 'var(--accent)' : 'var(--surface)',
              borderColor: key === 'pro' ? 'var(--accent)' : 'var(--border)',
              color: key === 'pro' ? 'var(--bg)' : 'var(--text)',
            }}>
              {key === 'pro' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                  style={{ background: 'var(--bg)', color: 'var(--accent)' }}>
                  Popular
                </div>
              )}
              <h3 className="text-lg font-medium mb-1">{plan.name}</h3>
              <div className="text-3xl font-light mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                {CUR}{plan.price}<span className="text-sm font-normal">/mês</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="text-sm flex items-center gap-2">
                    <span>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth?mode=signup" className="block text-center py-3 rounded-lg text-sm font-semibold uppercase tracking-wider transition-transform hover:-translate-y-0.5"
                style={{
                  background: key === 'pro' ? 'var(--bg)' : 'var(--accent)',
                  color: key === 'pro' ? 'var(--accent)' : 'var(--bg)',
                }}>
                Começar
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-12 text-sm" style={{ color: 'var(--dim)' }}>
        <p>© {new Date().getFullYear()} Barbearia SaaS · Feito em Portugal 🇵🇹</p>
      </div>
    </div>
  )
}
