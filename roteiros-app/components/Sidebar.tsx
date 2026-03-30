'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { downloadMultipleScriptsPDF } from '@/lib/pdf'
import { useRouter } from 'next/navigation'
import type { Script, Review } from '@/app/page'

interface HistoryItem {
  id: string
  tema: string
  formato: 'reel' | 'anuncio'
  framework: string
  created_at: string
  approved?: boolean
  approval_status?: string | null
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

type Tab = 'historico' | 'pre-aprovados' | 'aprovados' | 'rejeitados'

export default function Sidebar({ onSelectScript, selectedId, onNewScript }: Props) {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [approved, setApproved] = useState<HistoryItem[]>([])
  const [preApproved, setPreApproved] = useState<HistoryItem[]>([])
  const [rejected, setRejected] = useState<HistoryItem[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('historico')
  const [userEmail, setUserEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkLoading, setBulkLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchHistory()
    fetchApproved()
    fetchPreApproved()
    fetchRejected()
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
      .select('id, tema, formato, framework, created_at, approved, approval_status')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(50)
    setHistory(data ?? [])
    setLoading(false)
  }

  async function fetchApproved() {
    const { data } = await supabase
      .from('scripts')
      .select('id, tema, formato, framework, created_at, approved, approval_status')
      .eq('status', 'completed')
      .eq('approval_status', 'approved')
      .order('created_at', { ascending: false })
    setApproved(data ?? [])
  }

  async function fetchPreApproved() {
    const { data } = await supabase
      .from('scripts')
      .select('id, tema, formato, framework, created_at, approved, approval_status')
      .eq('status', 'completed')
      .eq('approval_status', 'pre_approved')
      .order('created_at', { ascending: false })
    setPreApproved(data ?? [])
  }

  async function fetchRejected() {
    const { data } = await supabase
      .from('scripts')
      .select('id, tema, formato, framework, created_at, approved, approval_status')
      .eq('status', 'completed')
      .eq('approval_status', 'rejected')
      .order('created_at', { ascending: false })
    setRejected(data ?? [])
  }

  async function handleRefresh() {
    await Promise.all([fetchHistory(), fetchApproved(), fetchPreApproved(), fetchRejected()])
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function handleTabChange(tab: Tab) {
    setActiveTab(tab)
    setSelectedIds(new Set())
  }

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll(items: HistoryItem[]) {
    const allIds = items.map(i => i.id)
    const allSelected = allIds.length > 0 && allIds.every(id => selectedIds.has(id))
    setSelectedIds(allSelected ? new Set() : new Set(allIds))
  }

  async function handleBulkApprove() {
    if (selectedIds.size === 0) return
    setBulkLoading(true)
    const ids = Array.from(selectedIds)
    await supabase.from('scripts')
      .update({ approval_status: 'approved', approved: true })
      .in('id', ids)
    setSelectedIds(new Set())
    await Promise.all([fetchApproved(), fetchPreApproved()])
    setBulkLoading(false)
  }

  async function handleBulkReject() {
    if (selectedIds.size === 0) return
    setBulkLoading(true)
    const ids = Array.from(selectedIds)
    await supabase.from('scripts')
      .update({ approval_status: 'rejected' })
      .in('id', ids)
    setSelectedIds(new Set())
    await Promise.all([fetchRejected(), fetchPreApproved()])
    setBulkLoading(false)
  }

  async function handleBulkRestore() {
    if (selectedIds.size === 0) return
    setBulkLoading(true)
    const ids = Array.from(selectedIds)
    await supabase.from('scripts')
      .update({ approval_status: 'pre_approved' })
      .in('id', ids)
    setSelectedIds(new Set())
    await Promise.all([fetchRejected(), fetchPreApproved()])
    setBulkLoading(false)
  }

  async function handleBulkExportPDF() {
    if (selectedIds.size === 0) return
    setBulkLoading(true)
    const ids = Array.from(selectedIds)
    const { data } = await supabase
      .from('scripts')
      .select('script, review, tema')
      .in('id', ids)
    if (data && data.length > 0) {
      const items = data.map(d => ({
        script: d.script as Script,
        review: d.review as Review | undefined,
        tema: d.tema as string,
      }))
      await downloadMultipleScriptsPDF(items)
    }
    setBulkLoading(false)
  }

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
          {item.approval_status === 'approved' && <span className="text-yellow-400 text-xs mt-0.5 shrink-0">⭐</span>}
          {item.approval_status === 'pre_approved' && <span className="text-blue-400 text-xs mt-0.5 shrink-0">⏳</span>}
          {item.approval_status === 'rejected' && <span className="text-red-400 text-xs mt-0.5 shrink-0">❌</span>}
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

  function SelectableScriptButton({ item }: { item: HistoryItem }) {
    const checked = selectedIds.has(item.id)
    return (
      <div className={`flex items-start gap-2 px-2 py-2 rounded-xl transition-all ${
        checked ? 'bg-solar-orange/10 border border-solar-orange/20' : 'border border-transparent'
      }`}>
        <input
          type="checkbox"
          checked={checked}
          onChange={() => toggleSelect(item.id)}
          className="mt-1 shrink-0 accent-solar-orange cursor-pointer"
        />
        <button
          onClick={() => onSelectScript(item.id)}
          className="flex-1 text-left min-w-0"
        >
          <div className="text-xs text-white font-medium truncate leading-snug mb-1">{item.tema}</div>
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
      </div>
    )
  }

  const historyGrouped = groupByDate(history)
  const approvedGrouped = groupByDate(approved)
  const allSelected = (list: HistoryItem[]) => list.length > 0 && list.every(i => selectedIds.has(i.id))

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

      {/* Tabs — 2 linhas de 2 */}
      <div className="border-b border-solar-border shrink-0">
        <div className="grid grid-cols-2">
          {([
            { key: 'historico', label: '🕐 Histórico', badge: null },
            { key: 'aprovados', label: '⭐ Aprovados', badge: approved.length },
          ] as const).map(({ key, label, badge }) => (
            <button
              key={key}
              onClick={() => handleTabChange(key)}
              className={`py-2 text-xs font-semibold transition-colors border-b-2 relative ${
                activeTab === key
                  ? key === 'aprovados' ? 'border-yellow-400 text-yellow-400' : 'border-solar-orange text-solar-orange'
                  : 'border-transparent text-solar-muted hover:text-white'
              }`}
            >
              {label}
              {badge !== null && badge > 0 && (
                <span className="absolute top-1 right-2 bg-yellow-500 text-black text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 border-t border-solar-border/50">
          {([
            { key: 'pre-aprovados', label: '⏳ Pré-Apr.', badge: preApproved.length },
            { key: 'rejeitados', label: '❌ Rejeitados', badge: rejected.length },
          ] as const).map(({ key, label, badge }) => (
            <button
              key={key}
              onClick={() => handleTabChange(key)}
              className={`py-2 text-xs font-semibold transition-colors border-b-2 relative ${
                activeTab === key
                  ? key === 'pre-aprovados' ? 'border-blue-400 text-blue-400' : 'border-red-400 text-red-400'
                  : 'border-transparent text-solar-muted hover:text-white'
              }`}
            >
              {label}
              {badge > 0 && (
                <span className={`absolute top-1 right-2 text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none ${
                  key === 'pre-aprovados' ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>
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

        {/* PRÉ-APROVADOS */}
        {activeTab === 'pre-aprovados' && (
          preApproved.length === 0 ? (
            <div className="text-center py-8 text-solar-muted text-xs px-2">
              Nenhum roteiro pré-aprovado ainda.<br />
              Após gerar um roteiro, clique em<br />
              <span className="text-blue-400 font-medium">⏳ Pré-Aprovar Roteiro</span>.
            </div>
          ) : (
            <>
              {/* Selecionar todos */}
              <div className="flex items-center gap-2 px-2 py-1.5">
                <input
                  type="checkbox"
                  checked={allSelected(preApproved)}
                  onChange={() => toggleSelectAll(preApproved)}
                  className="accent-solar-orange cursor-pointer"
                />
                <span className="text-xs text-solar-muted">
                  {selectedIds.size > 0 ? `${selectedIds.size} selecionado(s)` : 'Selecionar todos'}
                </span>
              </div>

              <div className="space-y-1">
                {preApproved.map(item => <SelectableScriptButton key={item.id} item={item} />)}
              </div>
            </>
          )
        )}

        {/* APROVADOS */}
        {activeTab === 'aprovados' && (
          approved.length === 0 ? (
            <div className="text-center py-8 text-solar-muted text-xs px-2">
              Nenhum roteiro aprovado ainda.<br />
              Selecione roteiros em Pré-Aprovados<br />
              e clique em <span className="text-green-400 font-medium">✓ Aprovar</span>.
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

        {/* REJEITADOS */}
        {activeTab === 'rejeitados' && (
          rejected.length === 0 ? (
            <div className="text-center py-8 text-solar-muted text-xs px-2">
              Nenhum roteiro rejeitado.
            </div>
          ) : (
            <>
              {/* Selecionar todos */}
              <div className="flex items-center gap-2 px-2 py-1.5">
                <input
                  type="checkbox"
                  checked={allSelected(rejected)}
                  onChange={() => toggleSelectAll(rejected)}
                  className="accent-solar-orange cursor-pointer"
                />
                <span className="text-xs text-solar-muted">
                  {selectedIds.size > 0 ? `${selectedIds.size} selecionado(s)` : 'Selecionar todos'}
                </span>
              </div>

              <div className="space-y-1">
                {rejected.map(item => <SelectableScriptButton key={item.id} item={item} />)}
              </div>
            </>
          )
        )}
      </div>

      {/* Barra de ações em lote — visível quando há seleção */}
      {selectedIds.size > 0 && activeTab === 'pre-aprovados' && (
        <div className="p-3 border-t border-solar-border space-y-1.5 bg-solar-card">
          <button
            onClick={handleBulkExportPDF}
            disabled={bulkLoading}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-solar-dark border border-solar-border text-xs text-white hover:border-slate-500 transition-all disabled:opacity-50"
          >
            {bulkLoading ? '...' : '⬇ Exportar PDF'}
          </button>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={handleBulkApprove}
              disabled={bulkLoading}
              className="flex items-center justify-center gap-1 py-2 rounded-lg bg-green-700/30 border border-green-600/40 text-xs text-green-400 hover:bg-green-700/50 transition-all disabled:opacity-50"
            >
              ✓ Aprovar
            </button>
            <button
              onClick={handleBulkReject}
              disabled={bulkLoading}
              className="flex items-center justify-center gap-1 py-2 rounded-lg bg-red-700/30 border border-red-600/40 text-xs text-red-400 hover:bg-red-700/50 transition-all disabled:opacity-50"
            >
              ✗ Rejeitar
            </button>
          </div>
        </div>
      )}

      {selectedIds.size > 0 && activeTab === 'rejeitados' && (
        <div className="p-3 border-t border-solar-border bg-solar-card">
          <button
            onClick={handleBulkRestore}
            disabled={bulkLoading}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-700/30 border border-blue-600/40 text-xs text-blue-400 hover:bg-blue-700/50 transition-all disabled:opacity-50"
          >
            {bulkLoading ? '...' : '↩ Restaurar para Pré-Aprovados'}
          </button>
        </div>
      )}

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
