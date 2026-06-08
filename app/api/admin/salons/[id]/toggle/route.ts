// ══════════════════════════════════════════
// app/api/admin/salons/[id]/toggle/route.ts
// ══════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { is_active } = await request.json()

    const { data: salon } = await supabase
      .from('salons')
      .update({ is_active })
      .eq('id', params.id)
      .select()
      .single()

    return NextResponse.json({ salon })
  } catch (err) {
    console.error('Admin toggle error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
