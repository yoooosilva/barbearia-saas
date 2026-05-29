// ══════════════════════════════════════════
// app/auth/page.tsx — Login / Registo
// ══════════════════════════════════════════

import { Suspense } from 'react'
import AuthForm from '@/components/auth/AuthForm'

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'radial-gradient(ellipse at 50% 0%, #1A1520 0%, #0A090D 60%)' }}>
        <p style={{ color: '#8D8899' }}>A carregar...</p>
      </div>
    }>
      <AuthForm />
    </Suspense>
  )
}
