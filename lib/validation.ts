// ══════════════════════════════════════════
// lib/validation.ts — Input validation schemas
// ══════════════════════════════════════════

import { z } from 'zod'

// ─────────────────────────────────────
// BOOKING
// ─────────────────────────────────────

export const bookingSchema = z.object({
  client_name: z.string().min(2, 'Nome mínimo 2 caracteres').max(100),
  client_phone: z.string().regex(/^9[1-9]\d{7}$|^\+351\s?9[1-9]\d{7}$/, 'Telefone PT inválido'),
  client_email: z.string().email('Email inválido').optional(),
  service_id: z.string().uuid('Serviço inválido'),
  staff_id: z.string().uuid('Profissional inválido'),
  date: z.string().refine(d => new Date(d) > new Date(), 'Data deve ser no futuro'),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Hora formato HH:MM'),
})

// ─────────────────────────────────────
// SALON SETTINGS
// ─────────────────────────────────────

export const salonSettingsSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().regex(/^9[1-9]\d{7}$/, 'Telefone PT inválido'),
  email: z.string().email(),
  city: z.string().min(2).max(50),
  address: z.string().min(5).max(200),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  instagram: z.string().regex(/^@?[\w.]{1,30}$/, 'Handle Instagram inválido').optional(),
  auto_confirm: z.boolean(),
  slot_interval: z.number().int().min(15).max(120),
  max_advance_days: z.number().int().min(1).max(365),
})

// ─────────────────────────────────────
// STAFF
// ─────────────────────────────────────

export const staffSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().regex(/^9[1-9]\d{7}$/).optional(),
  email: z.string().email().optional(),
  role: z.string().min(2).max(50),
})

// ─────────────────────────────────────
// SERVICE
// ─────────────────────────────────────

export const serviceSchema = z.object({
  name: z.string().min(2).max(100),
  duration: z.number().int().min(5).max(480),
  price: z.number().min(0).max(9999),
  category_id: z.string().uuid().optional(),
})

// ─────────────────────────────────────
// EXPORT TYPES
// ─────────────────────────────────────

export type BookingInput = z.infer<typeof bookingSchema>
export type SalonSettingsInput = z.infer<typeof salonSettingsSchema>
export type StaffInput = z.infer<typeof staffSchema>
export type ServiceInput = z.infer<typeof serviceSchema>
