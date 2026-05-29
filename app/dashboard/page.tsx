// ══════════════════════════════════════════
// app/dashboard/page.tsx — Dashboard do dono
// ══════════════════════════════════════════

import { createServerSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  // Buscar salão do dono
  const { data: salon } = await supabase
    .from('salons')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (!salon) redirect('/auth') // Sem salão → setup

  // Buscar dados em paralelo
  const [
    { data: staff },
    { data: services },
    { data: categories },
    { data: appointments },
    { data: staffServices },
    { data: billing },
  ] = await Promise.all([
    supabase.from('staff').select('*, schedules:staff_schedules(*, breaks:staff_breaks(*))').eq('salon_id', salon.id).order('sort_order'),
    supabase.from('services').select('*, category:service_categories(*)').eq('salon_id', salon.id).order('sort_order'),
    supabase.from('service_categories').select('*').eq('salon_id', salon.id).order('sort_order'),
    supabase.from('appointments').select('*, staff:staff(name, color), service:services(name)').eq('salon_id', salon.id).order('date', { ascending: false }).order('start_time').limit(200),
    supabase.from('staff_services').select('*').eq('salon_id', salon.id),
    supabase.from('salon_billing_summary').select('*').eq('salon_id', salon.id).single(),
  ])

  return (
    <DashboardClient
      salon={salon}
      staff={staff || []}
      services={services || []}
      categories={categories || []}
      appointments={appointments || []}
      staffServices={staffServices || []}
      billing={billing}
      userId={user.id}
    />
  )
}
