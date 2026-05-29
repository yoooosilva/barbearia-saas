// ══════════════════════════════════════════
// app/layout.tsx — Layout raiz
// ══════════════════════════════════════════

import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Barbearia SaaS — Sistema de Agendamento',
  description: 'Plataforma de agendamento online para barbearias em Portugal',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@300;400;500;600&family=Outfit:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
