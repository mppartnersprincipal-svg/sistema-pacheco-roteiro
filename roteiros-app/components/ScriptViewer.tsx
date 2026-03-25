'use client'

import { useState } from 'react'
import type { Hook, Script } from '@/app/page'
import { downloadScriptPDF } from '@/lib/pdf'

interface Props {
  script: Script
  chosenHook: Hook
  onEnterChat: () => void
  onApprove: () => void
  onBack: () => void
}

const SECTION_COLORS: Record<string, string> = {
  HOOK: 'text-solar-orange border-solar-orange/30 bg-solar-orange/5',
  SETUP: 'text-blue-400 border-blue-400/30 bg-blue-400/5',
  DELIVERY: 'text-purple-400 border-purple-400/30 bg-purple-400/5',
  CTA: 'text-green-400 border-green-400/30 bg-green-400/5',
  BODY: 'text-purple-400 border-purple-400/30 bg-purple-400/5',
}

export default function ScriptViewer({ script, chosenHook, onEnterChat, onApprove, onBack }: Props) {
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

  function handleCopy() {
    const lines: string[] = [
      `ROTEIRO — ${script.formato === 'reel' ? 'INSTAGRAM REEL' : 'ANÚNCIO META ADS'}`,
      `Tema: ${script.tema} | Duração: ${script.duracaoEstimada} | Framework: ${script.framework}`, '',
    ]
    script.secoes.forEach(s => {
      lines.push(`--- ${s.nome} (${s.tempo}) ---`)
      lines.push(`Cena: ${s.cena}`)
      lines.push(`Fala: "${s.fala}"`)
      lines.push(`Texto na tela: ${s.textoNaTela}`)
      if (s.botao) lines.push(`Botão: ${s.botao}`)
      lines.push('')
    })
    if (script.legenda) { lines.push('--- LEGENDA ---'); lines.push(script.legenda); lines.push('') }
    if (script.hashtags?.length) { lines.push(script.hashtags.join(' ')); lines.push('') }
    if (script.copyDoAnuncio) {
      lines.push('--- COPY ---')
      lines.push(`Headline: ${script.copyDoAnuncio.headline}`)
      lines.push(script.copyDoAnuncio.body)
      lines.push(`CTA: ${script.copyDoAnuncio.cta}`)
    }
    navigator.clipboard.writeText(lines.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handlePDF() {
    setDownloading(true)
    await downloadScriptPDF(script)
    setDownloading(false)
  }

  return (
    <div className="space-y-8">
      <div>
        <button onClick={onBack} className="text-xs text-solar-muted hover:text-white mb-4 flex items-center gap-1">
          ← Escolher outro gancho
        </button>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Roteiro gerado</h2>
            <p className="text-solar-muted text-sm">Revise e aprove para receber a análise e variante A/B.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCopy}
              className="text-xs px-3 py-2 rounded-lg border border-solar-border text-solar-muted hover:text-white hover:border-slate-500 transition-all">
              {copied ? '✓ Copiado' : '📋 Copiar'}
            </button>
            <button onClick={handlePDF} disabled={downloading}
              className="text-xs px-3 py-2 rounded-lg border border-solar-border text-solar-muted hover:text-white hover:border-slate-500 transition-all disabled:opacity-50">
              {downloading ? '...' : '⬇ PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* Gancho */}
      <div className="bg-solar-orange/10 border border-solar-orange/30 rounded-xl p-4">
        <div className="text-xs font-medium text-solar-orange mb-2">Gancho escolhido</div>
        <p className="text-white font-semibold">"{chosenHook.texto}"</p>
        <p className="text-xs text-solar-muted mt-1">{chosenHook.driver}</p>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-3 text-xs">
        {[
          script.formato === 'reel' ? '📱 Reel' : '🎯 Anúncio',
          `⏱ ${script.duracaoEstimada}`,
          script.framework,
          script.estagio,
        ].filter(Boolean).map((tag, i) => (
          <span key={i} className="px-3 py-1.5 bg-solar-card border border-solar-border rounded-full text-slate-400">{tag}</span>
        ))}
      </div>

      {/* Seções */}
      <div className="space-y-4">
        {script.secoes.map((secao, i) => {
          const colorClass = SECTION_COLORS[secao.nome] ?? 'text-slate-400 border-slate-400/30 bg-slate-400/5'
          return (
            <div key={i} className={`border rounded-xl p-5 ${colorClass}`}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-bold uppercase tracking-wide">{secao.nome}</span>
                <span className="text-xs opacity-60">{secao.tempo}</span>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-xs opacity-60 mb-1 font-medium">CENA / B-ROLL</div>
                  <p className="text-slate-300">{secao.cena}</p>
                </div>
                <div>
                  <div className="text-xs opacity-60 mb-1 font-medium">FALA</div>
                  <p className="text-white font-medium leading-relaxed">"{secao.fala}"</p>
                </div>
                <div>
                  <div className="text-xs opacity-60 mb-1 font-medium">TEXTO NA TELA</div>
                  <p className="text-slate-200 bg-black/20 rounded-lg px-3 py-2 font-semibold">{secao.textoNaTela}</p>
                </div>
                {secao.botao && (
                  <div>
                    <div className="text-xs opacity-60 mb-1 font-medium">BOTÃO</div>
                    <span className="inline-block bg-green-600 text-white text-xs px-4 py-1.5 rounded-full font-semibold">{secao.botao}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legenda */}
      {script.legenda && (
        <div className="bg-solar-card border border-solar-border rounded-xl p-5">
          <div className="text-xs font-medium text-solar-muted uppercase tracking-wide mb-3">Legenda do post</div>
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{script.legenda}</p>
          {script.hashtags?.length && <p className="mt-3 text-blue-400 text-xs">{script.hashtags.join(' ')}</p>}
        </div>
      )}

      {/* Áudio */}
      {script.direcaoAudio && (
        <div className="bg-solar-card border border-solar-border rounded-xl p-4">
          <div className="text-xs font-medium text-solar-muted uppercase tracking-wide mb-2">Direção de áudio</div>
          <p className="text-slate-300 text-sm">{script.direcaoAudio}</p>
        </div>
      )}

      {/* Copy anúncio */}
      {script.copyDoAnuncio && (
        <div className="bg-solar-card border border-solar-border rounded-xl p-5 space-y-3">
          <div className="text-xs font-medium text-solar-muted uppercase tracking-wide">Copy do anúncio</div>
          <div><div className="text-xs text-solar-muted mb-1">Headline</div><p className="text-white font-bold">{script.copyDoAnuncio.headline}</p></div>
          <div><div className="text-xs text-solar-muted mb-1">Body</div><p className="text-slate-300 text-sm whitespace-pre-line">{script.copyDoAnuncio.body}</p></div>
          <div><div className="text-xs text-solar-muted mb-1">CTA</div><p className="text-green-400 font-semibold text-sm">{script.copyDoAnuncio.cta}</p></div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3 pt-2">
        <button
          onClick={onEnterChat}
          className="w-full bg-solar-orange hover:bg-orange-500 text-white font-semibold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
        >
          💬 Refinar com IA →
        </button>
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 border border-solar-border text-solar-muted hover:text-white hover:border-slate-500 py-2.5 rounded-xl text-sm font-medium transition-all"
          >
            ← Trocar gancho
          </button>
          <button
            onClick={onApprove}
            className="flex-1 border border-solar-border text-slate-400 hover:text-white hover:border-slate-500 py-2.5 rounded-xl text-sm font-medium transition-all"
          >
            Aprovar direto →
          </button>
        </div>
      </div>
    </div>
  )
}
