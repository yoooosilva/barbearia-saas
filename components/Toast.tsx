// ══════════════════════════════════════════
// components/Toast.tsx
// ══════════════════════════════════════════

'use client'

import { useEffect, useState } from 'react'

const T = {
  bg: '#0A090D',
  text: '#F5F3F7',
  accent: '#D4A853',
  error: '#E05252',
  success: '#4CAF50',
  warning: '#FFC107',
}

export function useToast() {
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null)

  const show = (message: string, type = 'info') => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  return { toast, show }
}

export function Toast({ toast }: { toast: { type: string; message: string } | null }) {
  if (!toast) return null

  const colors: Record<string, string> = {
    success: T.success,
    error: T.error,
    warning: T.warning,
    info: T.accent,
  }

  return (
    <div className="fixed bottom-4 right-4 px-4 py-3 rounded-lg text-sm font-medium text-white animate-slideR z-50"
      style={{ background: colors[toast.type] || T.accent }}>
      {toast.message}
    </div>
  )
}
