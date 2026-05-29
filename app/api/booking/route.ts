// ══════════════════════════════════════════
// app/api/booking/route.ts — Notificar após marcação
// ══════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { notifyNewBooking } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { appointment_id, salon_slug } = body

    if (!appointment_id || !salon_slug) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Buscar dados do agendamento
    const { data: appt } = await supabase
      .from('appointments')
      .select('*, staff:staff(name), service:services(name)')
      .eq('id', appointment_id)
      .single()

    if (!appt) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // Buscar dados do salão e dono
    const { data: salon } = await supabase
      .from('salons')
      .select('*, owner:profiles(email, phone)')
      .eq('id', appt.salon_id)
      .single()

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 })
    }

    const owner = (salon as Record<string, unknown>).owner as { email: string; phone: string } | null

    // Enviar notificação
    await notifyNewBooking({
      ownerEmail: owner?.email || salon.email,
      ownerPhone: owner?.phone || salon.phone,
      salonName: salon.name,
      clientName: appt.client_name,
      serviceName: appt.service?.name || '',
      staffName: appt.staff?.name || '',
      date: appt.date,
      time: appt.start_time,
    })

    // Registar notificação na BD
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

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Booking notification error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
