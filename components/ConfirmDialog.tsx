// ══════════════════════════════════════════
// components/ConfirmDialog.tsx
// ══════════════════════════════════════════

'use client'

import { useState } from 'react'

const T = {
  bg: '#0A090D',
  surface: '#1A1520',
  text: '#F5F3F7',
  muted: '#8D8899',
  accent: '#D4A853',
  error: '#E05252',
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDangerous = false,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDangerous?: boolean
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}) {
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--surface)] rounded-xl p-6 max-w-sm border border-[var(--border)] animate-fadeUp"
        style={{ background: T.surface, borderColor: T.muted + '20' }}>
        <h2 className="text-lg font-medium mb-2" style={{ color: T.text }}>{title}</h2>
        <p className="text-sm mb-6" style={{ color: T.muted }}>{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ background: T.surface, color: T.text, border: `1px solid ${T.muted}30` }}>
            {cancelText}
          </button>
          <button onClick={handleConfirm} disabled={loading}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: isDangerous ? T.error : T.accent,
              color: T.bg,
              opacity: loading ? 0.7 : 1,
            }}>
            {loading ? 'Processando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
