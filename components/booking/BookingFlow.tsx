// ══════════════════════════════════════════
// components/booking/BookingFlow.tsx
// Fluxo de marcação em 4 passos (client-side)
// ══════════════════════════════════════════

'use client'

import { useState, useMemo, useCallback } from 'react'
import { createBooking, getAvailableSlots } from '@/lib/queries'
import { CUR, MONTHS, WEEKDAYS_SHORT, THEME as T } from '@/lib/constants'
import type { Salon, Service, ServiceCategory, Staff } from '@/lib/types'

interface Props {
  salon: Salon
  services: Service[]
  staff: Staff[]
  categories: ServiceCategory[]
  staffServices: { staff_id: string; service_id: string }[]
  slug: string
}

export default function BookingFlow({ salon, services, staff, categories, staffServices, slug }: Props) {
  const [step, setStep] = useState(0)
  const [selSvc, setSelSvc] = useState<Service | null>(null)
  const [selSt, setSelSt] = useState<Staff | null>(null)
  const [selDate, setSelDate] = useState<Date | null>(null)
  const [selTime, setSelTime] = useState<string | null>(null)
  const [name, setName] = useState(''); const [phone, setPhone] = useState(''); const [email, setEmail] = useState('')
  const [booked, setBooked] = useState(false)
  const [bookMsg, setBookMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [slots, setSlots] = useState<string[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [cM, setCM] = useState(new Date().getMonth()); const [cY, setCY] = useState(new Date().getFullYear())

  const today = new Date(); today.setHours(0,0,0,0)
  const maxDate = new Date(today); maxDate.setDate(today.getDate() + salon.max_advance_days)

  // Staff que fazem o serviço selecionado
  const avStaff = useMemo(() => {
    if (!selSvc) return []
    const ids = staffServices.filter(ss => ss.service_id === selSvc.id).map(ss => ss.staff_id)
    return staff.filter(s => ids.includes(s.id))
  }, [selSvc, staff, staffServices])

  // Fetch slots quando seleciona data
  const fetchSlots = useCallback(async (date: Date) => {
    if (!selSt || !selSvc) return
    setSlotsLoading(true)
    const dateStr = date.toISOString().split('T')[0]
    const result = await getAvailableSlots(slug, selSt.id, selSvc.id, dateStr)
    setSlots(result.slots || [])
    setSlotsLoading(false)
  }, [selSt, selSvc, slug])

  async function handleBook() {
    if (!name || !phone || !selSvc || !selSt || !selDate || !selTime) return
    setLoading(true)
    const dateStr = selDate.toISOString().split('T')[0]
    const result = await createBooking({
      slug, staffId: selSt.id, serviceId: selSvc.id,
      date: dateStr, time: selTime,
      name, phone, email,
    })
    if (result.error) { alert(result.error); setLoading(false); return }
    setBookMsg(result.message || salon.booking_message)
    setBooked(true)
    setLoading(false)
  }

  const dIM = new Date(cY, cM + 1, 0).getDate()
  const fDow = new Date(cY, cM, 1).getDay()

  const fmtDate = (d: Date) => `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`

  // ── Confirmação ──
  if (booked) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: `linear-gradient(180deg, ${T.bg}, #100E0C)` }}>
      <div className="text-center max-w-sm animate-fadeUp">
        <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center text-2xl" style={{ background: T.accent, boxShadow: `0 0 40px ${T.accent}40` }}>✓</div>
        <h2 className="text-2xl font-light mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Marcação Confirmada!</h2>
        <div className="rounded-xl p-4 mb-4 text-left" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <div className="flex justify-between mb-1">
            <span className="text-sm" style={{ color: T.muted }}>{selSvc?.name}</span>
            <span style={{ color: T.accent, fontFamily: "'Playfair Display', serif", fontSize: 18 }}>{CUR}{selSvc?.price}</span>
          </div>
          <div className="text-xs" style={{ color: T.muted }}>com {selSt?.name} · {selDate && fmtDate(selDate)} às {selTime} · {selSvc?.duration}min</div>
        </div>
        <p className="text-sm" style={{ color: T.dim }}>{bookMsg}</p>
      </div>
    </div>
  )

  // ── Steps ──
  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${T.bg}, #0E0D0B)` }}>
      {/* Header */}
      <div className="text-center px-5 pt-9 pb-4">
        <div className="inline-flex items-center gap-2 mb-1">
          <span className="text-xs uppercase tracking-[4px]" style={{ fontFamily: "'Playfair Display', serif", color: T.accent }}>{salon.name}</span>
        </div>
        <h1 className="text-2xl font-light" style={{ fontFamily: "'Playfair Display', serif" }}>Agendar Horário</h1>
        {salon.address && <p className="text-xs mt-1" style={{ color: T.dim }}>{salon.address}</p>}
      </div>

      {/* Progress */}
      <div className="flex justify-center gap-1 mb-5 px-4">
        {['Serviço', 'Profissional', 'Data & Hora', 'Confirmar'].map((l, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-semibold"
              style={{ background: step >= i ? T.accent : 'transparent', border: `1.5px solid ${step >= i ? T.accent : T.border}`, color: step >= i ? T.bg : T.dim }}>{i + 1}</div>
            <span className="text-[10px]" style={{ color: step >= i ? T.text : T.dim }}>{l}</span>
            {i < 3 && <div className="w-3 h-px" style={{ background: step > i ? T.accent : T.border }} />}
          </div>
        ))}
      </div>

      <div className="max-w-md mx-auto px-5 pb-16">
        {/* Step 0: Serviço */}
        {step === 0 && (
          <div className="animate-fadeUp">
            {categories.map(cat => {
              const svcs = services.filter(s => s.category_id === cat.id)
              if (!svcs.length) return null
              return (
                <div key={cat.id} className="mb-4">
                  <div className="text-xs uppercase tracking-[2px] mb-2" style={{ color: T.accent }}>{cat.name}</div>
                  {svcs.map(s => (
                    <button key={s.id} onClick={() => { setSelSvc(s); setSelSt(null); setSelDate(null); setSelTime(null); setStep(1) }}
                      className="w-full rounded-xl p-3 mb-2 flex justify-between items-center text-left transition-colors hover:border-[var(--accent)]"
                      style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                      <div>
                        <div className="text-sm font-medium">{s.name}</div>
                        <div className="text-xs" style={{ color: T.muted }}>{s.duration}min</div>
                      </div>
                      <div className="text-xl" style={{ fontFamily: "'Playfair Display', serif", color: T.accent }}>{CUR}{s.price}</div>
                    </button>
                  ))}
                </div>
              )
            })}
          </div>
        )}

        {/* Step 1: Profissional */}
        {step === 1 && (
          <div className="animate-fadeUp">
            <button onClick={() => setStep(0)} className="text-xs mb-3 flex items-center gap-1" style={{ color: T.muted }}>← Voltar</button>
            <p className="text-xs uppercase tracking-[2px] mb-3" style={{ color: T.muted }}>Profissional para {selSvc?.name}</p>
            {avStaff.map(s => (
              <button key={s.id} onClick={() => { setSelSt(s); setSelDate(null); setSelTime(null); setStep(2) }}
                className="w-full rounded-xl p-3 mb-2 flex items-center gap-3 text-left transition-colors hover:border-[var(--accent)]"
                style={{ background: T.surface, border: `1px solid ${T.border}`, borderLeft: `3px solid ${s.color}` }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                  style={{ background: `${s.color}20`, color: s.color }}>
                  {s.name[0]}
                </div>
                <div>
                  <div className="text-sm font-medium">{s.name}</div>
                  <div className="text-xs" style={{ color: T.muted }}>{s.role === 'dono' ? 'Proprietário' : 'Barbeiro'}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Data & Hora */}
        {step === 2 && (
          <div className="animate-fadeUp">
            <button onClick={() => setStep(1)} className="text-xs mb-3 flex items-center gap-1" style={{ color: T.muted }}>← Voltar</button>

            {/* Calendar */}
            <div className="rounded-xl p-4 mb-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
              <div className="flex justify-between items-center mb-3">
                <button onClick={() => { if (cM === 0) { setCM(11); setCY(y => y - 1) } else setCM(m => m - 1) }}
                  className="text-sm px-2" style={{ color: T.muted }}>←</button>
                <span className="text-sm" style={{ fontFamily: "'Playfair Display', serif" }}>{MONTHS[cM]} {cY}</span>
                <button onClick={() => { if (cM === 11) { setCM(0); setCY(y => y + 1) } else setCM(m => m + 1) }}
                  className="text-sm px-2" style={{ color: T.muted }}>→</button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {WEEKDAYS_SHORT.map(d => <div key={d} className="text-[9px] font-semibold" style={{ color: T.dim }}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: fDow }, (_, i) => <div key={`e${i}`} />)}
                {Array.from({ length: dIM }, (_, i) => {
                  const d = new Date(cY, cM, i + 1)
                  const past = d < today; const future = d > maxDate
                  const noWork = selSt?.schedules?.find(sc => sc.day_of_week === d.getDay())?.is_working === false
                  const sel = selDate && d.getTime() === selDate.getTime()
                  const off = past || noWork || future

                  return (
                    <button key={i} disabled={off}
                      onClick={() => { setSelDate(d); setSelTime(null); fetchSlots(d) }}
                      className="aspect-square rounded-md text-xs transition-colors"
                      style={{
                        background: sel ? T.accent : 'transparent',
                        color: sel ? T.bg : off ? T.dim : T.text,
                        opacity: off ? 0.2 : 1,
                        fontWeight: sel ? 600 : 400,
                      }}>
                      {i + 1}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Time slots */}
            {selDate && (
              <div className="animate-slideR">
                <p className="text-xs uppercase tracking-[2px] mb-2" style={{ color: T.muted }}>Horários — {fmtDate(selDate)}</p>
                {slotsLoading ? (
                  <p className="text-center text-sm py-8" style={{ color: T.dim }}>A carregar...</p>
                ) : !slots.length ? (
                  <p className="text-center text-sm py-8" style={{ color: T.dim }}>Sem horários disponíveis</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {slots.map(h => (
                      <button key={h} onClick={() => { setSelTime(h); setStep(3) }}
                        className="rounded-lg py-2.5 text-sm transition-colors hover:border-[var(--accent)]"
                        style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                        {h}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Confirmar */}
        {step === 3 && (
          <div className="animate-fadeUp">
            <button onClick={() => setStep(2)} className="text-xs mb-3 flex items-center gap-1" style={{ color: T.muted }}>← Voltar</button>

            {/* Resumo */}
            <div className="rounded-xl p-4 mb-4" style={{ background: T.surface, border: `1px solid ${T.accent}50` }}>
              <div className="text-xs uppercase tracking-[2px] mb-2" style={{ color: T.accent }}>Resumo</div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">{selSvc?.name}</span>
                <span style={{ color: T.accent, fontFamily: "'Playfair Display', serif", fontSize: 18 }}>{CUR}{selSvc?.price}</span>
              </div>
              <div className="text-xs" style={{ color: T.muted }}>com {selSt?.name} · {selDate && fmtDate(selDate)} às {selTime} · {selSvc?.duration}min</div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: T.muted }}>Nome completo *</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="O seu nome"
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.text }} />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: T.muted }}>Telefone *</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="912 345 678"
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.text }} />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: T.muted }}>Email (opcional)</label>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com"
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.text }} />
              </div>
            </div>

            {salon.cancel_policy && (
              <div className="text-xs mt-3 p-2.5 rounded-lg italic" style={{ color: T.dim, background: `${T.warning}06`, border: `1px solid ${T.warning}15` }}>
                📋 {salon.cancel_policy}
              </div>
            )}

            <button onClick={handleBook} disabled={!name || !phone || loading}
              className="w-full py-3.5 mt-4 rounded-xl text-sm font-semibold uppercase tracking-wider transition-transform hover:-translate-y-0.5 disabled:opacity-50"
              style={{ background: T.accent, color: T.bg, boxShadow: `0 4px 20px ${T.accent}40` }}>
              {loading ? 'A confirmar...' : 'Confirmar Marcação'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
