'use client'

import { useState } from 'react'
import type { Review, Script } from '@/app/page'
import { downloadScriptPDF } from '@/lib/pdf'
import { createClient } from '@/lib/supabase/client'

interface Props {
  review: Review
  script: Script
  scriptId?: string | null
  onNewScript: () => void
}

function ScoreBar({ value, label }: { value: number; label: string }) {
  const color = value >= 8 ? 'bg-green-500' : value >= 6 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className={value >= 8 ? 'text-green-400' : value >= 6 ? 'text-yellow-400' : 'text-red-400'}>{value}/10</span>
      </div>
      <div className="h-1.5 bg-solar-border rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value * 10}%` }} />
      </div>
    </div>
  )
}

const CHECKLIST_LABELS: Record<string, string> = {
  gancho2seg: 'Gancho nos primeiros 2-3 segundos',
  frasesCurtas: 'Frases curtas (máx 12 palavras)',
  textoNaTela: 'Texto na tela definido',
  vocabularioSolar: 'Vocabulário do instalador solar',
  dadosConcretos: 'Dados concretos da PachecoSolar',
  ctaEspecifico: 'CTA específico com ação clara',
  duracaoCorreta: 'Duração dentro do limite',
  semCliches: 'Sem clichês de abertura',
  legendaHook125: 'Legenda com hook nos 125 chars',
}

export default function ReviewPanel({ review, script, scriptId, onNewScript }: Props) {
  const [copiedAB, setCopiedAB] = useState(false)
  const [activeTab, setActiveTab] = useState<'review' | 'ab'>('review')
  const [downloading, setDownloading] = useState(false)
  const [approved, setApproved] = useState(false)
  const [approving, setApproving] = useState(false)

  async function handleMarkApproved() {
    if (!scriptId || approved) return
    setApproving(true)
    const supabase = createClient()
    await supabase.from('scripts').update({ approved: true }).eq('id', scriptId)
    setApproved(true)
    setApproving(false)
  }

  async function handlePDF() {
    setDownloading(true)
    await downloadScriptPDF(script, review)
    setDownloading(false)
  }

  function handleCopyAB() {
    navigator.clipboard.writeText(review.varianteAB.roteiro)
    setCopiedAB(true)
    setTimeout(() => setCopiedAB(false), 2000)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Revisão + Variante A/B</h2>
          <p className="text-solar-muted text-sm">Análise completa do roteiro com variante alternativa para testar.</p>
        </div>
        <button onClick={handlePDF} disabled={downloading}
          className="text-xs px-4 py-2 rounded-lg border border-solar-orange/40 text-solar-orange hover:bg-solar-orange hover:text-white transition-all disabled:opacity-50">
          {downloading ? 'Gerando...' : '⬇ Baixar PDF completo'}
        </button>
      </div>

      {/* Score geral */}
      <div className="bg-solar-card border border-solar-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xs text-solar-muted uppercase tracking-wide mb-1">Pontuação geral</div>
            <div className={`text-4xl font-bold ${review.pontuacaoGeral >= 8 ? 'text-green-400' : review.pontuacaoGeral >= 6 ? 'text-yellow-400' : 'text-red-400'}`}>
              {review.pontuacaoGeral}<span className="text-lg text-solar-muted">/10</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-solar-muted">{script.formato === 'reel' ? 'Instagram Reel' : 'Anúncio Meta Ads'}</div>
            <div className="text-sm text-white font-medium mt-0.5">{script.framework}</div>
          </div>
        </div>
        <div className="space-y-3">
          <ScoreBar value={review.scores.gancho} label="Gancho" />
          <ScoreBar value={review.scores.entrega} label="Entrega" />
          <ScoreBar value={review.scores.cta} label="CTA" />
          <ScoreBar value={review.scores.adequacaoPublico} label="Adequação ao público" />
          <ScoreBar value={review.scores.producao} label="Produção" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-solar-border">
        {(['review', 'ab'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === t ? 'border-solar-orange text-solar-orange' : 'border-transparent text-solar-muted hover:text-white'
            }`}>
            {t === 'review' ? 'Análise' : 'Variante A/B'}
          </button>
        ))}
      </div>

      {activeTab === 'review' && (
        <div className="space-y-6">
          {review.pontosFortres.length > 0 && (
            <div>
              <div className="text-xs font-medium text-green-400 uppercase tracking-wide mb-3">Pontos fortes</div>
              <div className="space-y-2">
                {review.pontosFortres.map((p, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-green-400 mt-0.5">✓</span><span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {review.melhorias.length > 0 && (
            <div>
              <div className="text-xs font-medium text-yellow-400 uppercase tracking-wide mb-3">Melhorias recomendadas</div>
              <div className="space-y-3">
                {review.melhorias.map((m, i) => (
                  <div key={i} className="bg-solar-card border border-solar-border rounded-xl p-4">
                    <div className="text-xs font-semibold text-solar-orange mb-1">{m.dimensao}</div>
                    <div className="text-sm text-slate-400 mb-2">{m.problema}</div>
                    <div className="text-sm text-white flex items-start gap-2">
                      <span className="text-yellow-400 shrink-0">→</span><span>{m.correcao}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="text-xs font-medium text-solar-muted uppercase tracking-wide mb-3">Checklist</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(review.checklist).map(([key, val]) => (
                <div key={key} className="flex items-center gap-2 text-xs">
                  <span className={val ? 'text-green-400' : 'text-red-400'}>{val ? '✓' : '✗'}</span>
                  <span className={val ? 'text-slate-400' : 'text-red-300'}>{CHECKLIST_LABELS[key] ?? key}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ab' && (
        <div className="space-y-6">
          <div className="bg-solar-card border border-solar-border rounded-xl p-4 space-y-2">
            <div className="text-xs font-medium text-solar-orange uppercase tracking-wide mb-2">O que está sendo testado</div>
            <div className="text-xs"><span className="text-solar-muted">Novo gancho: </span><span className="text-white font-semibold">"{review.varianteAB.gancho}"</span></div>
            <div className="text-xs"><span className="text-solar-muted">Driver: </span><span className="text-slate-300">{review.varianteAB.driverPsicologico}</span></div>
            <div className="text-xs text-slate-500 italic mt-1">{review.varianteAB.hipoteseTestada}</div>
          </div>

          <div className="bg-solar-card border border-solar-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-medium text-solar-muted uppercase tracking-wide">Roteiro variante A/B</div>
              <button onClick={handleCopyAB}
                className="text-xs px-3 py-1.5 rounded-lg border border-solar-border text-solar-muted hover:text-white hover:border-slate-500 transition-all">
                {copiedAB ? '✓ Copiado' : '📋 Copiar'}
              </button>
            </div>
            <pre className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">{review.varianteAB.roteiro}</pre>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 pt-2">
        {scriptId && (
          <button
            onClick={handleMarkApproved}
            disabled={approved || approving}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border transition-all ${
              approved
                ? 'bg-green-900/30 border-green-700/50 text-green-400 cursor-default'
                : 'border-green-700/50 text-green-400 hover:bg-green-900/30 disabled:opacity-50'
            }`}
          >
            {approved ? '✓ Salvo nos Aprovados' : approving ? 'Salvando...' : '⭐ Salvar nos Aprovados'}
          </button>
        )}
        <button onClick={onNewScript}
          className="w-full bg-solar-orange hover:bg-orange-500 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
          + Gerar novo roteiro
        </button>
      </div>
    </div>
  )
}
