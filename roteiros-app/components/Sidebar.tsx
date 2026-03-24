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
  approved?: boolean
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
  const [approved, setApproved] = useState<HistoryItem[]>([])
  const [activeTab, setActiveTab] = useState<'historico' | 'aprovados'>('historico')
  const [userEmail, setUserEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchHistory()
    fetchApproved()
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
      .select('id, tema, formato, framework, created_at, approved')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(50)
    setHistory(data ?? [])
    setLoading(false)
  }

  async function fetchApproved() {
    const { data } = await supabase
      .from('scripts')
      .select('id, tema, formato, framework, created_at, approved')
      .eq('status', 'completed')
      .eq('approved', true)
      .order('created_at', { ascending: false })
    setApproved(data ?? [])
  }

  async function handleRefresh() {
    await Promise.all([fetchHistory(), fetchApproved()])
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  // Group by date label
  function groupByDate(items: HistoryItem[]) {
    const grouped: Record<string, HistoryItem[]> = {}
    items.forEach(item => {
      const label = relativeDate(item.created_at)
      if (!grouped[label]) grouped[label] = []
      grouped[label].push(item)
    })
    return grouped
  }

  function ScriptButton({ item }: { item: HistoryItem }) {
    return (
      <button
        onClick={() => onSelectScript(item.id)}
        className={`w-full text-left px-3 py-2.5 rounded-xl transition-all group ${
          selectedId === item.id
            ? 'bg-solar-orange/15 border border-solar-orange/30'
            : 'hover:bg-solar-dark/60 border border-transparent'
        }`}
      >
        <div className="flex items-start gap-1.5">
          {item.approved && <span className="text-yellow-400 text-xs mt-0.5 shrink-0">⭐</span>}
          <div className="text-xs text-white font-medium truncate leading-snug mb-1 min-w-0">
            {item.tema}
          </div>
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
    )
  }

  const historyGrouped = groupByDate(history)
  const approvedGrouped = groupByDate(approved)

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

      {/* Tabs */}
      <div className="flex border-b border-solar-border shrink-0">
        <button
          onClick={() => setActiveTab('historico')}
          className={`flex-1 py-2.5 text-xs font-semibold transition-colors border-b-2 -mb-px ${
            activeTab === 'historico'
              ? 'border-solar-orange text-solar-orange'
              : 'border-transparent text-solar-muted hover:text-white'
          }`}
        >
          🕐 Histórico
        </button>
        <button
          onClick={() => setActiveTab('aprovados')}
          className={`flex-1 py-2.5 text-xs font-semibold transition-colors border-b-2 -mb-px relative ${
            activeTab === 'aprovados'
              ? 'border-yellow-400 text-yellow-400'
              : 'border-transparent text-solar-muted hover:text-white'
          }`}
        >
          ⭐ Aprovados
          {approved.length > 0 && (
            <span className="absolute top-1.5 right-3 bg-yellow-500 text-black text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
              {approved.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-hide">

        {/* HISTÓRICO */}
        {activeTab === 'historico' && (
          loading ? (
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
            Object.entries(historyGrouped).map(([dateLabel, items]) => (
              <div key={dateLabel}>
                <div className="text-xs font-medium text-solar-muted px-2 mb-1.5">{dateLabel}</div>
                <div className="space-y-1">
                  {items.map(item => <ScriptButton key={item.id} item={item} />)}
                </div>
              </div>
            ))
          )
        )}

        {/* APROVADOS */}
        {activeTab === 'aprovados' && (
          approved.length === 0 ? (
            <div className="text-center py-8 text-solar-muted text-xs px-2">
              Nenhum roteiro aprovado ainda.<br />
              Após gerar um roteiro, clique em<br />
              <span className="text-yellow-400 font-medium">⭐ Salvar nos Aprovados</span>.
            </div>
          ) : (
            Object.entries(approvedGrouped).map(([dateLabel, items]) => (
              <div key={dateLabel}>
                <div className="text-xs font-medium text-solar-muted px-2 mb-1.5">{dateLabel}</div>
                <div className="space-y-1">
                  {items.map(item => <ScriptButton key={item.id} item={item} />)}
                </div>
              </div>
            ))
          )
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-solar-border space-y-1">
        <button
          onClick={handleRefresh}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-solar-muted hover:text-white hover:bg-solar-dark/60 transition-all"
        >
          <span>↻</span> Atualizar
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
