// ══════════════════════════════════════════
// app/api/admin/metrics/route.ts
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

    const { data: metrics } = await supabase
      .from('admin_dashboard')
      .select('*')
      .single()

    return NextResponse.json(metrics || {})
  } catch (err) {
    console.error('Admin metrics error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
