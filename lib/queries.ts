// ══════════════════════════════════════════
// lib/queries.ts — Todas as queries ao Supabase
// ══════════════════════════════════════════

import { createClient, createAnonClient, createAdminClient } from './supabase'
import type {
  Salon, Service, ServiceCategory, Staff, StaffSchedule,
  StaffBreak, Appointment, Client, BookingResponse, SlotsResponse,
  SetupSalonResponse, BillingSummary, AdminDashboard, AdminSalonItem
} from './types'

// ─────────────────────────────────────
// PÚBLICO (sem login — página do cliente)
// ─────────────────────────────────────

export async function getSalonBySlug(slug: string) {
  const sb = createAnonClient()
  const { data, error } = await sb
    .from('salons')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .eq('is_published', true)
    .single()
  if (error) return null
  return data as Salon
}

export async function getSalonServices(salonId: string) {
  const sb = createAnonClient()
  const { data } = await sb
    .from('services')
    .select('*, category:service_categories(*)')
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .order('sort_order')
  return (data || []) as Service[]
}

export async function getSalonCategories(salonId: string) {
  const sb = createAnonClient()
  const { data } = await sb
    .from('service_categories')
    .select('*')
    .eq('salon_id', salonId)
    .order('sort_order')
  return (data || []) as ServiceCategory[]
}

export async function getSalonStaff(salonId: string) {
  const sb = createAnonClient()
  const { data } = await sb
    .from('staff')
    .select(`
      *,
      schedules:staff_schedules(
        *,
        breaks:staff_breaks(*)
      )
    `)
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .order('sort_order')
  return (data || []) as Staff[]
}

export async function getStaffServices(salonId: string) {
  const sb = createAnonClient()
  const { data } = await sb
    .from('staff_services')
    .select('staff_id, service_id')
    .eq('salon_id', salonId)
  return (data || []) as { staff_id: string; service_id: string }[]
}

export async function getAvailableSlots(slug: string, staffId: string, serviceId: string, date: string) {
  const sb = createAnonClient()
  const { data, error } = await sb.rpc('get_available_slots', {
    p_salon_slug: slug,
    p_staff_id: staffId,
    p_service_id: serviceId,
    p_date: date,
  })
  if (error) return { error: error.message } as SlotsResponse
  return data as SlotsResponse
}

export async function createBooking(params: {
  slug: string; staffId: string; serviceId: string;
  date: string; time: string;
  name: string; phone: string; email?: string;
}) {
  const sb = createAnonClient()
  const { data, error } = await sb.rpc('create_booking', {
    p_salon_slug: params.slug,
    p_staff_id: params.staffId,
    p_service_id: params.serviceId,
    p_date: params.date,
    p_time: params.time,
    p_client_name: params.name,
    p_client_phone: params.phone,
    p_client_email: params.email || '',
  })
  if (error) return { error: error.message } as BookingResponse
  return data as BookingResponse
}


// ─────────────────────────────────────
// AUTENTICADO (dono do salão)
// ─────────────────────────────────────

export async function getMySalon() {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return null
  const { data } = await sb
    .from('salons')
    .select('*')
    .eq('owner_id', user.id)
    .single()
  return data as Salon | null
}

export async function updateSalon(salonId: string, updates: Partial<Salon>) {
  const sb = createClient()
  const { error } = await sb
    .from('salons')
    .update(updates)
    .eq('id', salonId)
  return !error
}

export async function setupSalon(name: string, slug: string, phone?: string, city?: string) {
  const sb = createClient()
  const { data, error } = await sb.rpc('setup_salon', {
    p_name: name,
    p_slug: slug,
    p_phone: phone || '',
    p_city: city || '',
  })
  if (error) return { error: error.message } as SetupSalonResponse
  return data as SetupSalonResponse
}

// ── Appointments ──

export async function getSalonAppointments(salonId: string, filters?: {
  date?: string; status?: string; staffId?: string;
  from?: string; to?: string; limit?: number;
}) {
  const sb = createClient()
  let q = sb
    .from('appointments')
    .select('*, staff:staff(*), service:services(*)')
    .eq('salon_id', salonId)
    .order('date', { ascending: false })
    .order('start_time', { ascending: true })

  if (filters?.date) q = q.eq('date', filters.date)
  if (filters?.status) q = q.eq('status', filters.status)
  if (filters?.staffId) q = q.eq('staff_id', filters.staffId)
  if (filters?.from) q = q.gte('date', filters.from)
  if (filters?.to) q = q.lte('date', filters.to)
  if (filters?.limit) q = q.limit(filters.limit)

  const { data } = await q
  return (data || []) as Appointment[]
}

export async function updateAppointmentStatus(id: string, status: string) {
  const sb = createClient()
  const updates: Record<string, unknown> = { status }
  if (status === 'concluído') updates.completed_at = new Date().toISOString()
  if (status === 'cancelado') updates.cancelled_at = new Date().toISOString()
  const { error } = await sb.from('appointments').update(updates).eq('id', id)
  return !error
}

export async function createManualAppointment(params: {
  salonId: string; staffId: string; serviceId: string;
  date: string; startTime: string; duration: number; price: number;
  clientName: string; clientPhone?: string; clientEmail?: string;
  serviceName: string; endTime: string;
}) {
  const sb = createClient()
  const { error } = await sb.from('appointments').insert({
    salon_id: params.salonId,
    staff_id: params.staffId,
    service_id: params.serviceId,
    date: params.date,
    start_time: params.startTime,
    end_time: params.endTime,
    duration: params.duration,
    price: params.price,
    status: 'confirmado',
    source: 'dono',
    client_name: params.clientName,
    client_phone: params.clientPhone || '',
    client_email: params.clientEmail || '',
  })
  return !error
}

// ── Staff CRUD ──

export async function createStaffMember(salonId: string, data: Partial<Staff>) {
  const sb = createClient()
  const { data: staff, error } = await sb
    .from('staff')
    .insert({ salon_id: salonId, ...data })
    .select()
    .single()
  if (error || !staff) return null

  // Create default schedule
  const schedules = [0, 1, 2, 3, 4, 5, 6].map(dow => ({
    staff_id: staff.id,
    salon_id: salonId,
    day_of_week: dow,
    is_working: dow >= 1 && dow <= 5,
    start_time: dow >= 1 && dow <= 5 ? '09:00' : dow === 6 ? '09:00' : null,
    end_time: dow >= 1 && dow <= 5 ? '19:00' : dow === 6 ? '14:00' : null,
  }))
  await sb.from('staff_schedules').insert(schedules)
  return staff as Staff
}

export async function updateStaffMember(staffId: string, updates: Partial<Staff>) {
  const sb = createClient()
  const { error } = await sb.from('staff').update(updates).eq('id', staffId)
  return !error
}

export async function deleteStaffMember(staffId: string) {
  const sb = createClient()
  const { error } = await sb.from('staff').delete().eq('id', staffId)
  return !error
}

// ── Schedule ──

export async function updateStaffSchedule(scheduleId: string, updates: Partial<StaffSchedule>) {
  const sb = createClient()
  const { error } = await sb.from('staff_schedules').update(updates).eq('id', scheduleId)
  return !error
}

export async function addStaffBreak(scheduleId: string, salonId: string, brk: Partial<StaffBreak>) {
  const sb = createClient()
  const { data, error } = await sb
    .from('staff_breaks')
    .insert({ schedule_id: scheduleId, salon_id: salonId, ...brk })
    .select()
    .single()
  if (error) return null
  return data as StaffBreak
}

export async function deleteStaffBreak(breakId: string) {
  const sb = createClient()
  const { error } = await sb.from('staff_breaks').delete().eq('id', breakId)
  return !error
}

// ── Services CRUD ──

export async function createService(salonId: string, svc: Partial<Service>) {
  const sb = createClient()
  const { data, error } = await sb
    .from('services')
    .insert({ salon_id: salonId, ...svc })
    .select()
    .single()
  if (error) return null
  return data as Service
}

export async function updateService(serviceId: string, updates: Partial<Service>) {
  const sb = createClient()
  const { error } = await sb.from('services').update(updates).eq('id', serviceId)
  return !error
}

export async function deleteService(serviceId: string) {
  const sb = createClient()
  const { error } = await sb.from('services').delete().eq('id', serviceId)
  return !error
}

// ── Categories ──

export async function createCategory(salonId: string, name: string) {
  const sb = createClient()
  const { data, error } = await sb
    .from('service_categories')
    .insert({ salon_id: salonId, name })
    .select()
    .single()
  if (error) return null
  return data as ServiceCategory
}

export async function deleteCategory(catId: string) {
  const sb = createClient()
  const { error } = await sb.from('service_categories').delete().eq('id', catId)
  return !error
}

// ── Staff-Services N:N ──

export async function setStaffServices(staffId: string, salonId: string, serviceIds: string[]) {
  const sb = createClient()
  // Remove all, then re-insert
  await sb.from('staff_services').delete().eq('staff_id', staffId)
  if (serviceIds.length === 0) return true
  const rows = serviceIds.map(sid => ({ staff_id: staffId, service_id: sid, salon_id: salonId }))
  const { error } = await sb.from('staff_services').insert(rows)
  return !error
}

// ── Clients ──

export async function getSalonClients(salonId: string, opts?: { limit?: number; search?: string }) {
  const sb = createClient()
  let q = sb.from('clients').select('*').eq('salon_id', salonId).order('total_visits', { ascending: false })
  if (opts?.search) q = q.ilike('name', `%${opts.search}%`)
  if (opts?.limit) q = q.limit(opts.limit)
  const { data } = await q
  return (data || []) as Client[]
}

// ── Billing ──

export async function getBillingSummary(salonId: string) {
  const sb = createClient()
  const { data } = await sb
    .from('salon_billing_summary')
    .select('*')
    .eq('salon_id', salonId)
    .single()
  return data as BillingSummary | null
}

// ── Realtime subscription ──

export function subscribeToAppointments(salonId: string, callback: (payload: unknown) => void) {
  const sb = createClient()
  return sb
    .channel(`appointments:${salonId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'appointments', filter: `salon_id=eq.${salonId}` },
      callback
    )
    .subscribe()
}


// ─────────────────────────────────────
// ADMIN (platform_admin)
// ─────────────────────────────────────

export async function getAdminDashboard() {
  const sb = createClient()
  const { data } = await sb.from('admin_dashboard').select('*').single()
  return data as AdminDashboard | null
}

export async function getAdminSalons() {
  const sb = createClient()
  const { data } = await sb.from('admin_salons_list').select('*')
  return (data || []) as AdminSalonItem[]
}

export async function toggleSalonActive(salonId: string, active: boolean) {
  const sb = createAdminClient()
  const { error } = await sb.from('salons').update({ is_active: active }).eq('id', salonId)
  return !error
}
