'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface HistoryItem {
  id: string
  tema: string
  formato: 'reel' | 'anuncio'
  framework: string
  created_at: string
}

interface Props {
  onSelectScript: (id: string) => void
  selectedId?: string | null
  onNewScript: () => void
}

function relativeDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Hoje'
  if (days === 1) return 'Ontem'
  if (days < 7) return `${days} dias atrás`
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export default function Sidebar({ onSelectScript, selectedId, onNewScript }: Props) {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [userEmail, setUserEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchHistory()
    fetchUser()
  }, [])

  async function fetchUser() {
    const { data: { user } } = await supabase.auth.getUser()
    setUserEmail(user?.email ?? '')
  }

  async function fetchHistory() {
    setLoading(true)
    const { data } = await supabase
      .from('scripts')
      .select('id, tema, formato, framework, created_at')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(50)
    setHistory(data ?? [])
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  // Group history by date label
  const grouped: Record<string, HistoryItem[]> = {}
  history.forEach(item => {
    const label = relativeDate(item.created_at)
    if (!grouped[label]) grouped[label] = []
    grouped[label].push(item)
  })

  return (
    <aside className="flex flex-col h-full bg-solar-card border-r border-solar-border w-64 shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-solar-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-solar-orange rounded-lg flex items-center justify-center text-sm shrink-0">☀️</div>
          <div className="min-w-0">
            <div className="font-semibold text-sm text-white truncate">PachecoSolar</div>
            <div className="text-xs text-solar-muted">Gerador de Roteiros</div>
          </div>
        </div>
        <button
          onClick={onNewScript}
          className="w-full flex items-center justify-center gap-2 bg-solar-orange hover:bg-orange-500 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
        >
          <span>+</span> Novo roteiro
        </button>
      </div>

      {/* History */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-hide">
        {loading ? (
          <div className="space-y-2 pt-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 bg-solar-dark/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-solar-muted text-xs px-2">
            Nenhum roteiro gerado ainda.<br />Clique em "Novo roteiro" para começar.
          </div>
        ) : (
          Object.entries(grouped).map(([dateLabel, items]) => (
            <div key={dateLabel}>
              <div className="text-xs font-medium text-solar-muted px-2 mb-1.5">{dateLabel}</div>
              <div className="space-y-1">
                {items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => onSelectScript(item.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition-all group ${
                      selectedId === item.id
                        ? 'bg-solar-orange/15 border border-solar-orange/30'
                        : 'hover:bg-solar-dark/60 border border-transparent'
                    }`}
                  >
                    <div className="text-xs text-white font-medium truncate leading-snug mb-1">
                      {item.tema}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                        item.formato === 'reel'
                          ? 'bg-blue-900/40 text-blue-400'
                          : 'bg-orange-900/40 text-orange-400'
                      }`}>
                        {item.formato === 'reel' ? '📱 Reel' : '🎯 Anúncio'}
                      </span>
                      <span className="text-xs text-solar-muted">{item.framework}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-solar-border space-y-1">
        <button
          onClick={fetchHistory}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-solar-muted hover:text-white hover:bg-solar-dark/60 transition-all"
        >
          <span>↻</span> Atualizar histórico
        </button>
        <div className="px-3 py-2 text-xs text-solar-muted truncate">{userEmail}</div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all"
        >
          <span>→</span> Sair da conta
        </button>
      </div>
    </aside>
  )
}
