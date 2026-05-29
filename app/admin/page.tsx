// ══════════════════════════════════════════
// app/admin/page.tsx — Painel admin da plataforma
// ══════════════════════════════════════════

import { createServerSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import AdminPanel from '@/components/admin/AdminPanel'

export default async function AdminPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  // Verificar se é admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'platform_admin') redirect('/dashboard')

  // Buscar dados admin
  const [{ data: dashboard }, { data: salons }] = await Promise.all([
    supabase.from('admin_dashboard').select('*').single(),
    supabase.from('admin_salons_list').select('*'),
  ])

  return <AdminPanel dashboard={dashboard} salons={salons || []} />
}
