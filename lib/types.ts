// ══════════════════════════════════════════
// lib/types.ts — Tipos TypeScript (espelho do schema SQL)
// ══════════════════════════════════════════

export type SubscriptionPlan = 'trial' | 'basic' | 'pro'
export type SubscriptionStatus = 'active' | 'trial' | 'past_due' | 'cancelled' | 'expired'
export type AppointmentStatus = 'pendente' | 'confirmado' | 'concluído' | 'cancelado' | 'faltou'
export type AppointmentSource = 'cliente' | 'dono'
export type UserRole = 'platform_admin' | 'salon_owner' | 'salon_staff'

export interface Profile {
  id: string
  full_name: string
  email: string
  phone: string
  avatar_url: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Salon {
  id: string
  owner_id: string
  name: string
  slug: string
  description: string
  logo_url: string
  phone: string
  email: string
  instagram: string
  website: string
  address: string
  city: string
  country: string
  latitude: number | null
  longitude: number | null
  slot_interval: number
  max_advance_days: number
  min_advance_hours: number
  auto_confirm: boolean
  booking_message: string
  cancel_policy: string
  plan: SubscriptionPlan
  plan_status: SubscriptionStatus
  trial_ends_at: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  is_active: boolean
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface ServiceCategory {
  id: string
  salon_id: string
  name: string
  sort_order: number
  created_at: string
}

export interface Service {
  id: string
  salon_id: string
  category_id: string | null
  name: string
  duration: number
  price: number
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
  // joined
  category?: ServiceCategory
}

export interface Staff {
  id: string
  salon_id: string
  user_id: string | null
  name: string
  role: string
  phone: string
  email: string
  color: string
  avatar_url: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
  // joined
  schedules?: StaffSchedule[]
  services?: Service[]
}

export interface StaffSchedule {
  id: string
  staff_id: string
  salon_id: string
  day_of_week: number
  is_working: boolean
  start_time: string | null
  end_time: string | null
  // joined
  breaks?: StaffBreak[]
}

export interface StaffBreak {
  id: string
  schedule_id: string
  salon_id: string
  label: string
  start_time: string
  end_time: string
}

export interface Client {
  id: string
  salon_id: string
  name: string
  phone: string
  email: string
  notes: string
  total_visits: number
  total_spent: number
  no_shows: number
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  salon_id: string
  client_id: string | null
  staff_id: string
  service_id: string
  date: string
  start_time: string
  end_time: string
  duration: number
  price: number
  status: AppointmentStatus
  source: AppointmentSource
  client_name: string
  client_phone: string
  client_email: string
  notes: string
  created_at: string
  updated_at: string
  completed_at: string | null
  cancelled_at: string | null
  // joined
  staff?: Staff
  service?: Service
}

export interface PaymentHistory {
  id: string
  salon_id: string
  stripe_payment_id: string
  stripe_invoice_id: string
  amount: number
  currency: string
  status: string
  plan: SubscriptionPlan
  period_start: string
  period_end: string
  created_at: string
}

// ─── API responses ───

export interface BookingResponse {
  success?: boolean
  error?: string
  appointment_id?: string
  status?: AppointmentStatus
  salon_name?: string
  message?: string
}

export interface SlotsResponse {
  slots?: string[]
  error?: string
}

export interface SetupSalonResponse {
  success?: boolean
  error?: string
  salon_id?: string
  staff_id?: string
  slug?: string
}

// ─── Billing summary (view) ───

export interface BillingSummary {
  salon_id: string
  revenue_today: number
  appointments_today: number
  revenue_week: number
  revenue_month: number
  no_shows_month: number
  cancellations_month: number
}

// ─── Admin dashboard (view) ───

export interface AdminDashboard {
  total_salons: number
  active_subscriptions: number
  trial_salons: number
  problem_salons: number
  revenue_this_month: number
  total_revenue: number
  appointments_today: number
  total_clients: number
}

export interface AdminSalonItem {
  id: string
  name: string
  slug: string
  city: string
  plan: SubscriptionPlan
  plan_status: SubscriptionStatus
  trial_ends_at: string
  is_active: boolean
  is_published: boolean
  created_at: string
  owner_name: string
  owner_email: string
  total_appointments: number
  staff_count: number
  total_paid: number
}
