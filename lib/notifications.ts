// ══════════════════════════════════════════
// lib/notifications.ts — Email (Resend) + WhatsApp (CallMeBot)
// ══════════════════════════════════════════

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// ─── Email ───

export async function sendBookingEmail(params: {
  to: string
  salonName: string
  clientName: string
  serviceName: string
  staffName: string
  date: string
  time: string
  type: 'new_booking' | 'cancelled' | 'reminder'
}) {
  const subjects: Record<string, string> = {
    new_booking: `Nova marcação — ${params.clientName}`,
    cancelled: `Marcação cancelada — ${params.clientName}`,
    reminder: `Lembrete: ${params.clientName} às ${params.time}`,
  }

  const bodies: Record<string, string> = {
    new_booking: `
      <h2>Nova Marcação</h2>
      <p><strong>${params.clientName}</strong> marcou <strong>${params.serviceName}</strong></p>
      <p>📅 ${params.date} às ${params.time}</p>
      <p>✂️ Com ${params.staffName}</p>
      <p style="color:#888">— ${params.salonName}</p>
    `,
    cancelled: `
      <h2>Marcação Cancelada</h2>
      <p><strong>${params.clientName}</strong> cancelou <strong>${params.serviceName}</strong></p>
      <p>📅 ${params.date} às ${params.time}</p>
      <p style="color:#888">— ${params.salonName}</p>
    `,
    reminder: `
      <h2>Lembrete</h2>
      <p><strong>${params.clientName}</strong> tem <strong>${params.serviceName}</strong> hoje</p>
      <p>🕐 Às ${params.time} com ${params.staffName}</p>
      <p style="color:#888">— ${params.salonName}</p>
    `,
  }

  try {
    const { error } = await resend.emails.send({
      from: `${params.salonName} <${process.env.RESEND_FROM_EMAIL}>`,
      to: params.to,
      subject: subjects[params.type],
      html: bodies[params.type],
    })
    return !error
  } catch {
    console.error('Email send failed')
    return false
  }
}

// ─── WhatsApp via CallMeBot (gratuito) ───

export async function sendWhatsApp(phone: string, message: string) {
  const apiKey = process.env.CALLMEBOT_API_KEY
  if (!apiKey) return false

  // Formatar telefone PT: 912345678 → 351912345678
  let formatted = phone.replace(/\s+/g, '').replace(/^\+/, '')
  if (formatted.startsWith('9')) formatted = '351' + formatted

  try {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${formatted}&text=${encodeURIComponent(message)}&apikey=${apiKey}`
    const res = await fetch(url)
    return res.ok
  } catch {
    console.error('WhatsApp send failed')
    return false
  }
}

// ─── Notificação combinada ───

export async function notifyNewBooking(params: {
  ownerEmail: string
  ownerPhone: string
  salonName: string
  clientName: string
  serviceName: string
  staffName: string
  date: string
  time: string
}) {
  // Email ao dono
  await sendBookingEmail({
    to: params.ownerEmail,
    salonName: params.salonName,
    clientName: params.clientName,
    serviceName: params.serviceName,
    staffName: params.staffName,
    date: params.date,
    time: params.time,
    type: 'new_booking',
  })

  // WhatsApp ao dono
  if (params.ownerPhone) {
    await sendWhatsApp(
      params.ownerPhone,
      `✂️ *Nova marcação*\n${params.clientName}\n${params.serviceName}\n📅 ${params.date} às ${params.time}\nCom ${params.staffName}`
    )
  }
}
