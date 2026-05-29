// ══════════════════════════════════════════
// components/auth/AuthForm.tsx — Login / Registo form
// ══════════════════════════════════════════

'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { setupSalon } from '@/lib/queries'
import { generateSlug } from '@/lib/constants'

export default function AuthForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [mode, setMode] = useState<'login' | 'signup'>(params.get('mode') === 'signup' ? 'signup' : 'login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [salonName, setSalonName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')

  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); setLoading(false); return }
    router.push(params.get('redirect') || '/dashboard')
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')

    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    if (err || !data.user) { setError(err?.message || 'Erro ao criar conta'); setLoading(false); return }

    const slug = generateSlug(salonName)
    const result = await setupSalon(salonName, slug, phone, city)
    if (result.error) { setError(result.error); setLoading(false); return }

    router.push('/dashboard')
  }

  const inputStyle = "w-full px-4 py-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-sm outline-none focus:border-[var(--accent)] transition-colors"

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'radial-gradient(ellipse at 50% 0%, #1A1520 0%, #0A090D 60%)' }}>
      <div className="w-full max-w-sm animate-fadeUp">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-light tracking-widest" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--accent)' }}>
            ✂ Barbearia SaaS
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>
            {mode === 'login' ? 'Entrar na sua conta' : 'Criar conta · 14 dias grátis'}
          </p>
        </div>

        <div className="flex gap-1 p-1 rounded-lg mb-6 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          {(['login', 'signup'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              className="flex-1 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors"
              style={{ background: mode === m ? 'var(--accent)' : 'transparent', color: mode === m ? 'var(--bg)' : 'var(--muted)' }}>
              {m === 'login' ? 'Entrar' : 'Registar'}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-xs" style={{ background: 'rgba(224,82,82,0.1)', border: '1px solid rgba(224,82,82,0.3)', color: 'var(--error)' }}>
            {error}
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className={inputStyle} required />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className={inputStyle} required />
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-lg text-sm font-semibold uppercase tracking-wider transition-transform hover:-translate-y-0.5 disabled:opacity-50"
              style={{ background: 'var(--accent)', color: 'var(--bg)' }}>
              {loading ? 'A entrar...' : 'Entrar'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-3">
            <input type="text" placeholder="O seu nome" value={name} onChange={e => setName(e.target.value)} className={inputStyle} required />
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className={inputStyle} required />
            <input type="password" placeholder="Password (mín. 6 caracteres)" value={password} onChange={e => setPassword(e.target.value)} className={inputStyle} required minLength={6} />
            <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs mb-3 uppercase tracking-wider" style={{ color: 'var(--muted)' }}>O seu salão</p>
              <div className="space-y-3">
                <input type="text" placeholder="Nome da barbearia" value={salonName} onChange={e => setSalonName(e.target.value)} className={inputStyle} required />
                {salonName && (
                  <p className="text-xs" style={{ color: 'var(--dim)' }}>
                    URL: app.com/<span style={{ color: 'var(--accent)' }}>{generateSlug(salonName)}</span>
                  </p>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <input type="tel" placeholder="Telefone" value={phone} onChange={e => setPhone(e.target.value)} className={inputStyle} />
                  <input type="text" placeholder="Cidade" value={city} onChange={e => setCity(e.target.value)} className={inputStyle} />
                </div>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-lg text-sm font-semibold uppercase tracking-wider transition-transform hover:-translate-y-0.5 disabled:opacity-50"
              style={{ background: 'var(--accent)', color: 'var(--bg)' }}>
              {loading ? 'A criar...' : 'Criar Conta Grátis'}
            </button>
          </form>
        )}

        <p className="text-center text-xs mt-6" style={{ color: 'var(--dim)' }}>
          {mode === 'login' ? (
            <>Não tem conta? <button onClick={() => setMode('signup')} style={{ color: 'var(--accent)' }}>Registar grátis</button></>
          ) : (
            <>Já tem conta? <button onClick={() => setMode('login')} style={{ color: 'var(--accent)' }}>Entrar</button></>
          )}
        </p>
      </div>
    </div>
  )
}
