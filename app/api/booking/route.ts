// ══════════════════════════════════════════
// app/api/booking/route.ts — Notificar após marcação
// ══════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { notifyNewBooking } from '@/lib/notifications'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/ratelimit'
import { AppError, getUserMessage } from '@/lib/errors'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://barbearia-saas-rose.vercel.app',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS })
}

export async function POST(request: NextRequest) {
  try {
    // ✅ Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(`booking:${ip}`, 20, 60000)) {
      const headers = { ...CORS_HEADERS, ...getRateLimitHeaders(`booking:${ip}`, 20, 60000) }
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers }
      )
    }

    const body = await request.json()
    const { appointment_id, salon_slug } = body

    if (!appointment_id || !salon_slug) {
      throw new AppError('INVALID_INPUT', 'Dados faltam')
    }

    const supabase = createAdminClient()

    const { data: appt } = await supabase
      .from('appointments')
      .select('*, staff:staff(name), service:services(name)')
      .eq('id', appointment_id)
      .single()

    if (!appt) {
      throw new AppError('APPOINTMENT_NOT_FOUND', 'Agendamento não encontrado')
    }

    const { data: salon } = await supabase
      .from('salons')
      .select('*, owner:profiles(email, phone)')
      .eq('id', appt.salon_id)
      .single()

    if (!salon) {
      throw new AppError('SALON_NOT_FOUND', 'Salão não encontrado')
    }

    const owner = (salon as Record<string, unknown>).owner as { email: string; phone: string } | null

    const { data: quotaData } = await supabase.rpc('check_daily_email_quota', { p_salon_id: salon.id })
    const quota = quotaData as { can_send: boolean; used: number; limit: number } | null

    if (quota && !quota.can_send && salon.plan === 'basic') {
      await supabase.from('notifications').insert({
        salon_id: salon.id,
        appointment_id: appt.id,
        type: 'new_booking',
        channel: 'email',
        recipient: owner?.email || salon.email,
        subject: `[QUOTA] Nova marcação — ${appt.client_name}`,
        body: `Limite de 50 emails/dia atingido. Upgrade para Pro.`,
        error: 'DAILY_EMAIL_QUOTA_EXCEEDED',
        created_at: new Date().toISOString(),
      })
      return NextResponse.json({ warning: 'Email quota exceeded' }, { status: 200, headers: CORS_HEADERS })
    }

    const notifSent = await notifyNewBooking({
      ownerEmail: owner?.email || salon.email,
      ownerPhone: owner?.phone || salon.phone,
      salonName: salon.name,
      clientName: appt.client_name,
      serviceName: appt.service?.name || '',
      staffName: appt.staff?.name || '',
      date: appt.date,
      time: appt.start_time,
    })

    if (notifSent) {
      await supabase.rpc('increment_email_count', { p_salon_id: salon.id })
    }

    await supabase.from('notifications').insert({
      salon_id: salon.id,
      appointment_id: appt.id,
      type: 'new_booking',
      channel: 'email',
      recipient: owner?.email || salon.email,
      subject: `Nova marcação — ${appt.client_name}`,
      body: `${appt.service?.name} com ${appt.staff?.name} em ${appt.date} às ${appt.start_time}`,
      sent_at: new Date().toISOString(),
    })

    return NextResponse.json({ success: true }, { headers: CORS_HEADERS })
  } catch (err) {
    console.error('Booking error:', err)
    const message = getUserMessage(err)
    return NextResponse.json({ error: message }, { status: 400, headers: CORS_HEADERS })
  }
}
