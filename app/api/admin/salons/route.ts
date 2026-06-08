// ══════════════════════════════════════════
// app/api/admin/salons/route.ts
// ══════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'platform_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: salons } = await supabase
      .from('admin_salons_list')
      .select('*')
      .order('created_at', { ascending: false })

    return NextResponse.json({ salons: salons || [] })
  } catch (err) {
    console.error('Admin salons error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
