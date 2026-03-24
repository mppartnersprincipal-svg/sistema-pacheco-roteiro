'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('E-mail ou senha incorretos.')
    } else {
      router.push('/')
      router.refresh()
    }
    setLoading(false)
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${siteUrl}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
    } else {
      setSuccess('Conta criada! Verifique seu e-mail para confirmar o acesso.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-solar-dark flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-solar-orange rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">☀️</div>
          <h1 className="text-xl font-bold text-white">PachecoSolar</h1>
          <p className="text-solar-muted text-sm mt-1">Gerador de Roteiros</p>
        </div>

        {/* Card */}
        <div className="bg-solar-card border border-solar-border rounded-2xl p-6">
          {/* Tabs */}
          <div className="flex border-b border-solar-border mb-6">
            <button
              onClick={() => { setTab('login'); setError(null); setSuccess(null) }}
              className={`flex-1 pb-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === 'login' ? 'border-solar-orange text-solar-orange' : 'border-transparent text-solar-muted hover:text-white'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => { setTab('signup'); setError(null); setSuccess(null) }}
              className={`flex-1 pb-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === 'signup' ? 'border-solar-orange text-solar-orange' : 'border-transparent text-solar-muted hover:text-white'
              }`}
            >
              Criar conta
            </button>
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-xl px-4 py-3">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 text-sm text-green-400 bg-green-900/20 border border-green-800 rounded-xl px-4 py-3">
              {success}
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  className="w-full bg-solar-dark border border-solar-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-solar-muted focus:outline-none focus:border-solar-orange transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-solar-dark border border-solar-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-solar-muted focus:outline-none focus:border-solar-orange transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-solar-orange hover:bg-orange-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Nome</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="Seu nome"
                  className="w-full bg-solar-dark border border-solar-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-solar-muted focus:outline-none focus:border-solar-orange transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  className="w-full bg-solar-dark border border-solar-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-solar-muted focus:outline-none focus:border-solar-orange transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-solar-dark border border-solar-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-solar-muted focus:outline-none focus:border-solar-orange transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-solar-orange hover:bg-orange-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
              >
                {loading ? 'Criando conta...' : 'Criar conta'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
