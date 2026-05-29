// ══════════════════════════════════════════
// app/[slug]/page.tsx — Página pública de marcação
// ══════════════════════════════════════════
// Ex: app.com/barbearia-do-mestre
// O cliente acede aqui para marcar (sem login)

import { getSalonBySlug, getSalonServices, getSalonStaff, getSalonCategories, getStaffServices } from '@/lib/queries'
import { notFound } from 'next/navigation'
import BookingFlow from '@/components/booking/BookingFlow'
import type { Metadata } from 'next'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const salon = await getSalonBySlug(slug)
  if (!salon) return { title: 'Não encontrado' }
  return {
    title: `${salon.name} — Agendar`,
    description: salon.description || `Agende o seu horário na ${salon.name}`,
  }
}

export default async function BookingPage({ params }: Props) {
  const { slug } = await params
  const salon = await getSalonBySlug(slug)
  if (!salon) notFound()

  // Buscar tudo em paralelo
  const [services, staff, categories, staffServices] = await Promise.all([
    getSalonServices(salon.id),
    getSalonStaff(salon.id),
    getSalonCategories(salon.id),
    getStaffServices(salon.id),
  ])

  return (
    <BookingFlow
      salon={salon}
      services={services}
      staff={staff}
      categories={categories}
      staffServices={staffServices}
      slug={slug}
    />
  )
}
