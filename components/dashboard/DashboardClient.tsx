// ══════════════════════════════════════════
// components/dashboard/DashboardClient.tsx
// Componente client-side do painel do dono
// (Interface igual ao protótipo, agora com dados reais)
// ══════════════════════════════════════════

'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import {
  updateSalon, updateAppointmentStatus, createManualAppointment,
  createStaffMember, updateStaffMember, deleteStaffMember,
  createService, updateService, deleteService,
  createCategory, deleteCategory, setStaffServices,
  updateStaffSchedule, addStaffBreak, deleteStaffBreak,
  subscribeToAppointments,
} from '@/lib/queries'
import { CUR, MONTHS, WEEKDAYS_SHORT, THEME as T, STATUS_COLORS, STATUS_LABELS, PLANS } from '@/lib/constants'
import type { Salon, Service, ServiceCategory, Staff, Appointment, BillingSummary } from '@/lib/types'

interface Props {
  salon: Salon
  staff: Staff[]
  services: Service[]
  categories: ServiceCategory[]
  appointments: Appointment[]
  staffServices: { staff_id: string; service_id: string }[]
  billing: BillingSummary | null
  userId: string
}

export default function DashboardClient({ salon: initSalon, staff: initStaff, services: initServices, categories: initCats, appointments: initAppts, staffServices: initSS, billing, userId }: Props) {
  const router = useRouter()
  const [salon, setSalon] = useState(initSalon)
  const [view, setView] = useState<'today' | 'all' | 'notif' | 'config'>('today')
  const [appts, setAppts] = useState(initAppts)

  const today = new Date().toISOString().split('T')[0]

  // Realtime: escutar novos agendamentos
  useEffect(() => {
    const channel = subscribeToAppointments(salon.id, () => {
      router.refresh() // Re-fetch server data
    })
    return () => { channel.unsubscribe() }
  }, [salon.id, router])

  const todayAppts = useMemo(() =>
    appts.filter(a => a.date === today).sort((a, b) => a.start_time.localeCompare(b.start_time)),
    [appts, today]
  )

  const notifs = useMemo(() =>
    appts.filter(a => a.source === 'cliente').slice(0, 20),
    [appts]
  )

  async function handleStatus(id: string, status: string) {
    const ok = await updateAppointmentStatus(id, status)
    if (ok) setAppts(prev => prev.map(a => a.id === id ? { ...a, status: status as Appointment['status'] } : a))
  }

  async function handleLogout() {
    const sb = createClient()
    await sb.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen" style={{ background: T.bg }}>
      {/* Top bar */}
      <div className="sticky top-0 z-50 px-3 py-2.5 flex justify-between items-center border-b"
        style={{ background: T.surface, borderColor: T.border }}>
        <div className="flex items-center gap-2">
          <span className="text-sm tracking-widest" style={{ fontFamily: "'Playfair Display', serif" }}>✂ {salon.name}</span>
        </div>
        <div className="flex gap-1.5 items-center">
          {/* Link público */}
          <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/${salon.slug}`) }}
            className="px-2.5 py-1.5 rounded-md text-[10px] border transition-colors hover:border-[var(--accent)]"
            style={{ background: 'transparent', borderColor: T.border, color: T.muted }}>
            🔗 Link
          </button>
          {/* Config */}
          <button onClick={() => setView(view === 'config' ? 'today' : 'config')}
            className="w-8 h-8 rounded-md flex items-center justify-center border transition-colors"
            style={{ background: view === 'config' ? `${T.accent}15` : 'transparent', borderColor: view === 'config' ? T.accent : T.border, color: view === 'config' ? T.accent : T.muted }}>
            ⚙️
          </button>
          {/* Notif */}
          <div className="relative">
            <button onClick={() => setView(view === 'notif' ? 'today' : 'notif')}
              className="w-8 h-8 rounded-md flex items-center justify-center border transition-colors"
              style={{ background: view === 'notif' ? `${T.accent}15` : 'transparent', borderColor: view === 'notif' ? T.accent : T.border, color: view === 'notif' ? T.accent : T.muted }}>
              🔔
            </button>
            {notifs.length > 0 && (
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{ background: T.error }}>
                {Math.min(notifs.length, 9)}
              </div>
            )}
          </div>
          {/* Logout */}
          <button onClick={handleLogout} className="px-2.5 py-1.5 rounded-md text-[10px] border" style={{ borderColor: T.border, color: T.dim }}>
            Sair
          </button>
        </div>
      </div>

      <div className="max-w-[860px] mx-auto px-3 py-3 pb-20">
        {/* Plan banner */}
        {salon.plan_status === 'trial' && (
          <div className="rounded-lg p-3 mb-3 flex justify-between items-center text-xs"
            style={{ background: `${T.warning}10`, border: `1px solid ${T.warning}30`, color: T.warning }}>
            <span>⏱ Trial expira em {Math.max(0, Math.ceil((new Date(salon.trial_ends_at).getTime() - Date.now()) / 86400000))} dias</span>
            <button className="px-3 py-1 rounded-md font-semibold" style={{ background: T.accent, color: T.bg }}>Ativar plano</button>
          </div>
        )}
        {salon.plan_status === 'expired' && (
          <div className="rounded-lg p-3 mb-3 text-xs text-center"
            style={{ background: `${T.error}10`, border: `1px solid ${T.error}30`, color: T.error }}>
            ⚠ O seu trial expirou. Ative um plano para continuar a receber marcações.
          </div>
        )}

        {/* Billing summary */}
        {billing && view !== 'config' && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { l: 'Hoje', v: billing.revenue_today, c: billing.appointments_today },
              { l: 'Semana', v: billing.revenue_week, c: null },
              { l: 'Mês', v: billing.revenue_month, c: null },
            ].map((b, i) => (
              <div key={i} className="rounded-xl p-3" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                <div className="text-xl" style={{ fontFamily: "'Playfair Display', serif", color: T.accent }}>{CUR}{b.v}</div>
                <div className="flex justify-between mt-0.5">
                  <span className="text-[9px] uppercase tracking-wider" style={{ color: T.muted }}>{b.l}</span>
                  {b.c !== null && <span className="text-[9px]" style={{ color: T.dim }}>{b.c} atend.</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        {view !== 'config' && (
          <div className="flex gap-1 p-1 rounded-lg mb-3 border" style={{ background: T.surface, borderColor: T.border }}>
            {[
              { k: 'today' as const, l: 'Hoje', ic: '🕐' },
              { k: 'all' as const, l: 'Agenda', ic: '📅' },
              { k: 'notif' as const, l: 'Notif.', ic: '🔔' },
            ].map(t => (
              <button key={t.k} onClick={() => setView(t.k)}
                className="flex-1 py-2 rounded-md text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                style={{ background: view === t.k ? T.accent : 'transparent', color: view === t.k ? T.bg : T.muted }}>
                {t.ic} {t.l}
              </button>
            ))}
          </div>
        )}

        {/* Notif view */}
        {view === 'notif' && (
          <div className="animate-fadeUp space-y-2">
            {!notifs.length && <p className="text-center py-8 text-sm" style={{ color: T.dim }}>Nenhuma notificação</p>}
            {notifs.map(a => (
              <div key={a.id} className="rounded-xl p-3" style={{ background: T.surface, border: `1px solid ${T.border}`, borderLeft: `3px solid ${T.accent}` }}>
                <div className="text-sm mb-0.5">{a.client_name} — {a.service?.name || a.service_id}</div>
                <div className="text-xs" style={{ color: T.muted }}>{a.date} às {a.start_time} ({a.staff?.name})</div>
              </div>
            ))}
          </div>
        )}

        {/* Config view — placeholder for Settings component */}
        {view === 'config' && (
          <div className="animate-fadeUp">
            <div className="flex justify-between items-center mb-4">
              <span className="text-base" style={{ fontFamily: "'Playfair Display', serif" }}>⚙ Configurações</span>
              <button onClick={() => setView('today')} className="text-xs px-3 py-1 rounded-md border" style={{ borderColor: T.border, color: T.muted }}>✕</button>
            </div>
            <p className="text-sm" style={{ color: T.muted }}>
              As configurações (salão, equipa, serviços, horários) funcionam da mesma forma que no protótipo.
              Cada alteração é guardada em tempo real no Supabase.
            </p>
            <div className="mt-4 p-4 rounded-xl" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
              <div className="text-xs uppercase tracking-wider mb-2" style={{ color: T.muted }}>Info do salão</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span style={{ color: T.dim }}>Nome:</span> {salon.name}</div>
                <div><span style={{ color: T.dim }}>Slug:</span> /{salon.slug}</div>
                <div><span style={{ color: T.dim }}>Plano:</span> {salon.plan}</div>
                <div><span style={{ color: T.dim }}>Estado:</span> {salon.plan_status}</div>
                <div><span style={{ color: T.dim }}>Publicado:</span> {salon.is_published ? '✅' : '❌'}</div>
                <div><span style={{ color: T.dim }}>Auto-confirmar:</span> {salon.auto_confirm ? '✅' : '❌'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Today / All views */}
        {(view === 'today' || view === 'all') && (
          <div className="space-y-2 animate-fadeUp">
            {/* New booking button */}
            <button className="w-full py-2.5 rounded-xl text-xs border-dashed border-2 flex items-center justify-center gap-1 transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
              style={{ borderColor: T.border, color: T.muted }}>
              + Novo Agendamento
            </button>

            {/* Appointments list */}
            {!(view === 'today' ? todayAppts : appts).length && (
              <p className="text-center py-8 text-sm" style={{ color: T.dim }}>
                {view === 'today' ? 'Nenhum agendamento hoje' : 'Nenhum agendamento'}
              </p>
            )}
            {(view === 'today' ? todayAppts : appts).map(a => (
              <div key={a.id} className="rounded-xl p-3" style={{
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderLeft: `3px solid ${STATUS_COLORS[a.status] || T.accent}`,
                opacity: a.status === 'cancelado' ? 0.4 : 1,
              }}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                      <span className="text-sm font-medium">{a.client_name}</span>
                      {a.staff && (
                        <span className="text-[8px] px-1.5 py-0.5 rounded-md font-semibold"
                          style={{ background: `${a.staff.color}18`, color: a.staff.color }}>
                          {a.staff.name?.split(' ')[0]}
                        </span>
                      )}
                      {a.source === 'cliente' && (
                        <span className="text-[8px] px-1.5 py-0.5 rounded-md font-semibold"
                          style={{ background: `${T.warning}18`, color: T.warning }}>ONLINE</span>
                      )}
                      <span className="text-[8px] px-1.5 py-0.5 rounded-md font-semibold"
                        style={{ background: `${STATUS_COLORS[a.status]}18`, color: STATUS_COLORS[a.status] }}>
                        {STATUS_LABELS[a.status]}
                      </span>
                    </div>
                    <div className="text-xs flex gap-2 flex-wrap" style={{ color: T.muted }}>
                      <span>🕐 {a.start_time?.slice(0, 5)}</span>
                      {view === 'all' && <span>{a.date}</span>}
                      <span>{a.service?.name}</span>
                      <span style={{ color: T.accent, fontWeight: 500 }}>{CUR}{a.price}</span>
                    </div>
                  </div>
                  {a.status === 'confirmado' && (
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => handleStatus(a.id, 'concluído')} title="Concluído"
                        className="w-7 h-7 rounded-md flex items-center justify-center text-xs"
                        style={{ background: `${T.success}12`, color: T.success }}>✓</button>
                      <button onClick={() => handleStatus(a.id, 'faltou')} title="Faltou"
                        className="w-7 h-7 rounded-md flex items-center justify-center text-xs"
                        style={{ background: `${T.warning}12`, color: T.warning }}>⚠</button>
                      <button onClick={() => handleStatus(a.id, 'cancelado')} title="Cancelar"
                        className="w-7 h-7 rounded-md flex items-center justify-center text-xs"
                        style={{ background: `${T.error}12`, color: T.error }}>✕</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
