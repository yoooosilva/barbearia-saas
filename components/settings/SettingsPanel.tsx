// ══════════════════════════════════════════
// components/settings/SettingsPanel.tsx
// Configurações completas do salão (4 tabs)
// ══════════════════════════════════════════

'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  updateSalon, createStaffMember, updateStaffMember, deleteStaffMember,
  createService, updateService, deleteService,
  createCategory, deleteCategory, setStaffServices,
  updateStaffSchedule, addStaffBreak, deleteStaffBreak,
} from '@/lib/queries'
import { CUR, WEEKDAYS_FULL, THEME as T, STAFF_COLORS } from '@/lib/constants'
import type { Salon, Service, ServiceCategory, Staff, StaffSchedule, StaffBreak } from '@/lib/types'

interface Props {
  salon: Salon
  staff: Staff[]
  services: Service[]
  categories: ServiceCategory[]
  staffServices: { staff_id: string; service_id: string }[]
  onClose: () => void
}

export default function SettingsPanel({ salon: initSalon, staff: initStaff, services: initSvcs, categories: initCats, staffServices: initSS, onClose }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<'salon' | 'staff' | 'services' | 'schedule'>('salon')
  const [salon, setSalon] = useState(initSalon)
  const [staffList, setStaffList] = useState(initStaff)
  const [svcList, setSvcList] = useState(initSvcs)
  const [catList, setCatList] = useState(initCats)
  const [saving, setSaving] = useState(false)

  const inputCls = "w-full px-3 py-2 rounded-lg text-sm outline-none focus:border-[var(--accent)] transition-colors"
  const inputStyle = { background: T.bg, border: `1px solid ${T.border}`, color: T.text }

  // ── SALON TAB ──
  async function saveSalon() {
    setSaving(true)
    await updateSalon(salon.id, {
      name: salon.name, phone: salon.phone, email: salon.email,
      address: salon.address, city: salon.city, instagram: salon.instagram,
      description: salon.description, auto_confirm: salon.auto_confirm,
      is_published: salon.is_published, booking_message: salon.booking_message,
      cancel_policy: salon.cancel_policy, slot_interval: salon.slot_interval,
      max_advance_days: salon.max_advance_days, min_advance_hours: salon.min_advance_hours,
    })
    setSaving(false)
    router.refresh()
  }

  // ── STAFF TAB ──
  async function addStaff() {
    const name = prompt('Nome do profissional:')
    if (!name) return
    const newStaff = await createStaffMember(salon.id, {
      name, role: 'barbeiro', color: STAFF_COLORS[staffList.length % STAFF_COLORS.length],
    })
    if (newStaff) { setStaffList(prev => [...prev, newStaff]); router.refresh() }
  }

  async function removeStaff(id: string) {
    if (!confirm('Remover este profissional?')) return
    await deleteStaffMember(id)
    setStaffList(prev => prev.filter(s => s.id !== id))
    router.refresh()
  }

  // ── SERVICES TAB ──
  async function addSvc() {
    const name = prompt('Nome do serviço:')
    if (!name) return
    const dur = parseInt(prompt('Duração (min):') || '30')
    const price = parseFloat(prompt('Preço (€):') || '15')
    const catId = catList[0]?.id || null
    const newSvc = await createService(salon.id, { name, duration: dur, price, category_id: catId })
    if (newSvc) { setSvcList(prev => [...prev, newSvc]); router.refresh() }
  }

  async function removeSvc(id: string) {
    if (!confirm('Remover este serviço?')) return
    await deleteService(id)
    setSvcList(prev => prev.filter(s => s.id !== id))
    router.refresh()
  }

  async function addCat() {
    const name = prompt('Nome da categoria:')
    if (!name) return
    const cat = await createCategory(salon.id, name)
    if (cat) setCatList(prev => [...prev, cat])
  }

  const tabs = [
    { k: 'salon' as const, l: '🏪 Salão' },
    { k: 'staff' as const, l: '👥 Equipa' },
    { k: 'services' as const, l: '✂ Serviços' },
    { k: 'schedule' as const, l: '🕐 Horários' },
  ]

  return (
    <div className="animate-fadeUp">
      <div className="flex justify-between items-center mb-4">
        <span className="text-base" style={{ fontFamily: "'Playfair Display', serif" }}>⚙ Configurações</span>
        <button onClick={onClose} className="text-xs px-3 py-1 rounded-md border" style={{ borderColor: T.border, color: T.muted }}>✕ Fechar</button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-lg mb-4 border overflow-x-auto" style={{ background: T.surface, borderColor: T.border }}>
        {tabs.map(t => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className="flex-1 py-2 px-2 rounded-md text-xs font-medium whitespace-nowrap transition-colors"
            style={{ background: tab === t.k ? T.accent : 'transparent', color: tab === t.k ? T.bg : T.muted }}>
            {t.l}
          </button>
        ))}
      </div>

      {/* ── SALÃO ── */}
      {tab === 'salon' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: T.muted }}>Nome</label>
              <input value={salon.name} onChange={e => setSalon({ ...salon, name: e.target.value })} className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: T.muted }}>Telefone</label>
              <input value={salon.phone} onChange={e => setSalon({ ...salon, phone: e.target.value })} className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: T.muted }}>Email</label>
              <input value={salon.email} onChange={e => setSalon({ ...salon, email: e.target.value })} className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: T.muted }}>Instagram</label>
              <input value={salon.instagram} onChange={e => setSalon({ ...salon, instagram: e.target.value })} className={inputCls} style={inputStyle} placeholder="@handle" />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: T.muted }}>Morada</label>
              <input value={salon.address} onChange={e => setSalon({ ...salon, address: e.target.value })} className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: T.muted }}>Cidade</label>
              <input value={salon.city} onChange={e => setSalon({ ...salon, city: e.target.value })} className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: T.muted }}>Intervalo slots (min)</label>
              <input type="number" value={salon.slot_interval} onChange={e => setSalon({ ...salon, slot_interval: +e.target.value })} className={inputCls} style={inputStyle} />
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input type="checkbox" checked={salon.auto_confirm} onChange={e => setSalon({ ...salon, auto_confirm: e.target.checked })}
                className="accent-[var(--accent)]" />
              <span style={{ color: T.muted }}>Auto-confirmar marcações</span>
            </label>
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input type="checkbox" checked={salon.is_published} onChange={e => setSalon({ ...salon, is_published: e.target.checked })}
                className="accent-[var(--accent)]" />
              <span style={{ color: T.muted }}>Publicado (visível ao público)</span>
            </label>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: T.muted }}>Mensagem de confirmação</label>
            <textarea value={salon.booking_message} onChange={e => setSalon({ ...salon, booking_message: e.target.value })}
              rows={2} className={inputCls} style={inputStyle} />
          </div>

          <button onClick={saveSalon} disabled={saving}
            className="px-6 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-transform hover:-translate-y-0.5 disabled:opacity-50"
            style={{ background: T.accent, color: T.bg }}>
            {saving ? 'A guardar...' : 'Guardar Alterações'}
          </button>
        </div>
      )}

      {/* ── EQUIPA ── */}
      {tab === 'staff' && (
        <div className="space-y-2">
          {staffList.map(s => (
            <div key={s.id} className="rounded-xl p-3 flex items-center gap-3"
              style={{ background: T.surface, border: `1px solid ${T.border}`, borderLeft: `3px solid ${s.color}` }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                style={{ background: `${s.color}20`, color: s.color }}>
                {s.name[0]}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{s.name}</div>
                <div className="text-xs" style={{ color: T.muted }}>{s.role} {s.phone && `· ${s.phone}`}</div>
              </div>
              <button onClick={() => removeStaff(s.id)} className="text-xs px-2 py-1 rounded-md"
                style={{ background: `${T.error}12`, color: T.error }}>✕</button>
            </div>
          ))}
          <button onClick={addStaff}
            className="w-full py-2.5 rounded-xl text-xs border-dashed border-2 flex items-center justify-center gap-1"
            style={{ borderColor: T.border, color: T.muted }}>
            + Adicionar Profissional
          </button>
        </div>
      )}

      {/* ── SERVIÇOS ── */}
      {tab === 'services' && (
        <div className="space-y-3">
          {/* Categories */}
          <div className="flex gap-2 flex-wrap items-center">
            {catList.map(c => (
              <span key={c.id} className="text-[10px] px-2 py-1 rounded-md flex items-center gap-1"
                style={{ background: `${T.accent}12`, color: T.accent }}>
                {c.name}
                <button onClick={async () => { await deleteCategory(c.id); setCatList(prev => prev.filter(x => x.id !== c.id)) }}
                  className="text-[8px] opacity-50 hover:opacity-100">✕</button>
              </span>
            ))}
            <button onClick={addCat} className="text-[10px] px-2 py-1 rounded-md border" style={{ borderColor: T.border, color: T.dim }}>+ cat</button>
          </div>

          {/* Services */}
          {svcList.map(s => (
            <div key={s.id} className="rounded-xl p-3 flex justify-between items-center"
              style={{ background: T.surface, border: `1px solid ${T.border}` }}>
              <div>
                <div className="text-sm font-medium">{s.name}</div>
                <div className="text-xs" style={{ color: T.muted }}>{s.duration}min · {s.category?.name || 'Sem cat.'}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg" style={{ fontFamily: "'Playfair Display', serif", color: T.accent }}>{CUR}{s.price}</span>
                <button onClick={() => removeSvc(s.id)} className="text-xs px-2 py-1 rounded-md"
                  style={{ background: `${T.error}12`, color: T.error }}>✕</button>
              </div>
            </div>
          ))}
          <button onClick={addSvc}
            className="w-full py-2.5 rounded-xl text-xs border-dashed border-2 flex items-center justify-center gap-1"
            style={{ borderColor: T.border, color: T.muted }}>
            + Adicionar Serviço
          </button>
        </div>
      )}

      {/* ── HORÁRIOS ── */}
      {tab === 'schedule' && (
        <div className="space-y-3">
          {staffList.map(s => (
            <div key={s.id} className="rounded-xl p-3" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
              <div className="text-xs font-medium mb-2 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                {s.name}
              </div>
              <div className="space-y-1">
                {(s.schedules || []).sort((a: StaffSchedule, b: StaffSchedule) => a.day_of_week - b.day_of_week).map((sc: StaffSchedule) => (
                  <div key={sc.id} className="flex items-center gap-2 text-xs">
                    <span className="w-16 shrink-0" style={{ color: sc.is_working ? T.text : T.dim }}>
                      {WEEKDAYS_FULL[sc.day_of_week]?.slice(0, 3)}
                    </span>
                    {sc.is_working ? (
                      <span style={{ color: T.muted }}>{sc.start_time?.slice(0, 5)} — {sc.end_time?.slice(0, 5)}</span>
                    ) : (
                      <span style={{ color: T.dim }}>Folga</span>
                    )}
                    {sc.breaks?.map((b: StaffBreak) => (
                      <span key={b.id} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: `${T.warning}12`, color: T.warning }}>
                        {b.label} {b.start_time?.slice(0, 5)}-{b.end_time?.slice(0, 5)}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <p className="text-xs text-center pt-2" style={{ color: T.dim }}>
            Para editar horários detalhadamente, utilize o painel de cada profissional.
          </p>
        </div>
      )}
    </div>
  )
}
