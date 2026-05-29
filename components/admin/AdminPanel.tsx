// ══════════════════════════════════════════
// components/admin/AdminPanel.tsx — Painel do platform admin
// ══════════════════════════════════════════

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toggleSalonActive } from '@/lib/queries'
import { CUR, THEME as T, STATUS_COLORS } from '@/lib/constants'
import type { AdminDashboard, AdminSalonItem } from '@/lib/types'

interface Props {
  dashboard: AdminDashboard | null
  salons: AdminSalonItem[]
}

export default function AdminPanel({ dashboard, salons: initSalons }: Props) {
  const router = useRouter()
  const [salons, setSalons] = useState(initSalons)
  const [search, setSearch] = useState('')

  const filtered = salons.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.owner_email.toLowerCase().includes(search.toLowerCase()) ||
    s.city?.toLowerCase().includes(search.toLowerCase())
  )

  async function handleToggle(salonId: string, active: boolean) {
    const ok = await toggleSalonActive(salonId, active)
    if (ok) setSalons(prev => prev.map(s => s.id === salonId ? { ...s, is_active: active } : s))
  }

  const d = dashboard

  return (
    <div className="min-h-screen" style={{ background: T.bg }}>
      {/* Header */}
      <div className="sticky top-0 z-50 px-4 py-3 border-b flex justify-between items-center"
        style={{ background: T.surface, borderColor: T.border }}>
        <span className="text-sm tracking-widest" style={{ fontFamily: "'Playfair Display', serif", color: T.accent }}>
          👑 Admin — Barbearia SaaS
        </span>
        <button onClick={() => router.push('/dashboard')} className="text-xs px-3 py-1.5 rounded-md border"
          style={{ borderColor: T.border, color: T.muted }}>
          ← Dashboard
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* KPIs */}
        {d && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { l: 'Salões', v: d.total_salons, c: T.text },
              { l: 'Subscrições ativas', v: d.active_subscriptions, c: T.success },
              { l: 'Em trial', v: d.trial_salons, c: T.warning },
              { l: 'Receita do mês', v: `${CUR}${d.revenue_this_month}`, c: T.accent },
              { l: 'Receita total', v: `${CUR}${d.total_revenue}`, c: T.accent },
              { l: 'Agendamentos hoje', v: d.appointments_today, c: T.info },
              { l: 'Clientes total', v: d.total_clients, c: T.text },
              { l: 'Com problemas', v: d.problem_salons, c: T.error },
            ].map((m, i) => (
              <div key={i} className="rounded-xl p-3" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                <div className="text-xl font-light" style={{ fontFamily: "'Playfair Display', serif", color: m.c }}>{m.v}</div>
                <div className="text-[9px] uppercase tracking-wider mt-0.5" style={{ color: T.muted }}>{m.l}</div>
              </div>
            ))}
          </div>
        )}

        {/* Search */}
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Pesquisar salão, email, cidade..."
          className="w-full px-4 py-2.5 rounded-lg text-sm outline-none mb-4"
          style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.text }} />

        {/* Salon list */}
        <div className="space-y-2">
          {filtered.map(s => (
            <div key={s.id} className="rounded-xl p-4 flex justify-between items-start gap-3"
              style={{ background: T.surface, border: `1px solid ${T.border}`, opacity: s.is_active ? 1 : 0.5 }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-sm font-medium truncate">{s.name}</span>
                  <span className="text-[8px] px-1.5 py-0.5 rounded-md font-semibold"
                    style={{ background: `${STATUS_COLORS[s.plan_status] || T.dim}18`, color: STATUS_COLORS[s.plan_status] || T.dim }}>
                    {s.plan_status.toUpperCase()}
                  </span>
                  <span className="text-[8px] px-1.5 py-0.5 rounded-md" style={{ background: `${T.accent}15`, color: T.accent }}>
                    {s.plan}
                  </span>
                </div>
                <div className="text-xs flex flex-wrap gap-3" style={{ color: T.muted }}>
                  <span>👤 {s.owner_name}</span>
                  <span>📧 {s.owner_email}</span>
                  {s.city && <span>📍 {s.city}</span>}
                  <span>✂ {s.staff_count} staff</span>
                  <span>📅 {s.total_appointments} marcações</span>
                  <span style={{ color: T.accent }}>{CUR}{s.total_paid} pago</span>
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => window.open(`/${s.slug}`, '_blank')}
                  className="px-2 py-1 rounded-md text-[10px] border" style={{ borderColor: T.border, color: T.muted }}>
                  Ver
                </button>
                <button onClick={() => handleToggle(s.id, !s.is_active)}
                  className="px-2 py-1 rounded-md text-[10px] font-semibold"
                  style={{ background: s.is_active ? `${T.error}15` : `${T.success}15`, color: s.is_active ? T.error : T.success }}>
                  {s.is_active ? 'Desativar' : 'Ativar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
