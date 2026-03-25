'use client'

import { useState, useRef, useEffect } from 'react'
import type { Script, Hook, StrategistBrief, Formato, ChatMessage } from '@/app/page'

interface Props {
  script: Script
  chosenHook: Hook
  brief: StrategistBrief
  formato: Formato
  chatHistory: ChatMessage[]
  loading: boolean
  onSendMessage: (message: string) => void
  onApprove: () => void
  onBack: () => void
}

const SUGGESTIONS = [
  'Encurta as falas',
  'Deixa o CTA mais urgente',
  'Troca o gancho',
  'Adiciona mais dados técnicos',
]

const SECTION_COLORS: Record<string, string> = {
  HOOK: 'text-solar-orange',
  SETUP: 'text-blue-400',
  DELIVERY: 'text-purple-400',
  CTA: 'text-green-400',
  BODY: 'text-purple-400',
}

export default function ScriptChat({
  script,
  chatHistory,
  loading,
  onSendMessage,
  onApprove,
  onBack,
}: Props) {
  const [inputText, setInputText] = useState('')
  const [scriptExpanded, setScriptExpanded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, loading])

  function handleSend() {
    const trimmed = inputText.trim()
    if (!trimmed || loading) return
    onSendMessage(trimmed)
    setInputText('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={onBack}
          className="text-xs text-solar-muted hover:text-white mb-4 flex items-center gap-1 transition-colors"
        >
          ← Voltar ao roteiro
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Refinar com IA</h2>
            <p className="text-solar-muted text-sm">
              Peça ajustes, melhorias ou mudanças. O roteiro será atualizado em tempo real.
            </p>
          </div>
          <button
            onClick={onApprove}
            disabled={loading}
            className="shrink-0 bg-solar-orange hover:bg-orange-500 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors disabled:opacity-50"
          >
            Aprovar →
          </button>
        </div>
      </div>

      {/* Roteiro colapsável */}
      <div className="bg-solar-card border border-solar-border rounded-xl overflow-hidden">
        <button
          onClick={() => setScriptExpanded(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm text-slate-300 hover:text-white transition-colors"
        >
          <span className="font-medium">
            📄 {script.tema} — {script.duracaoEstimada}
          </span>
          <span className="text-solar-muted text-xs">
            {scriptExpanded ? '▲ Recolher' : '▼ Ver roteiro atual'}
          </span>
        </button>
        {scriptExpanded && (
          <div className="px-4 pb-4 border-t border-solar-border space-y-3 pt-3">
            {script.secoes.map((s, i) => {
              const colorClass = SECTION_COLORS[s.nome] ?? 'text-slate-400'
              return (
                <div key={i} className="text-xs space-y-1">
                  <div className={`font-bold uppercase ${colorClass}`}>
                    {s.nome}{' '}
                    <span className="text-solar-muted font-normal normal-case">{s.tempo}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">"{s.fala}"</p>
                  <p className="text-solar-muted">Tela: {s.textoNaTela}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Mensagens */}
      <div className="space-y-3 min-h-[180px]">
        {chatHistory.length === 0 && (
          <div className="text-center text-solar-muted text-sm py-6">
            <p className="mb-4">O que você quer melhorar no roteiro?</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => onSendMessage(s)}
                  disabled={loading}
                  className="text-xs px-3 py-1.5 bg-solar-card border border-solar-border rounded-full text-slate-400 hover:border-solar-orange hover:text-solar-orange transition-all disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {chatHistory.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-solar-orange/15 border border-solar-orange/30 text-white rounded-br-sm'
                  : 'bg-solar-card border border-solar-border text-slate-300 rounded-bl-sm'
              }`}
            >
              {msg.content}
              {msg.role === 'assistant' && msg.scriptUpdated && (
                <div className="mt-2 pt-2 border-t border-solar-border">
                  <button
                    onClick={() => setScriptExpanded(true)}
                    className="text-xs px-2.5 py-1 bg-green-900/30 border border-green-700/50 text-green-400 rounded-full hover:bg-green-900/50 transition-colors"
                  >
                    ✓ Roteiro atualizado — ver alterações
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-solar-card border border-solar-border rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="w-4 h-4 border-2 border-solar-orange border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 items-end">
        <textarea
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Peça uma mudança... (Enter para enviar, Shift+Enter para nova linha)"
          disabled={loading}
          rows={2}
          className="flex-1 bg-solar-card border border-solar-border rounded-xl px-4 py-3 text-sm text-white placeholder-solar-muted resize-none focus:outline-none focus:border-solar-orange transition-colors disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={loading || !inputText.trim()}
          className="bg-solar-orange hover:bg-orange-500 text-white font-semibold px-4 py-3 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          Enviar
        </button>
      </div>

      {/* Botões de ação */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="border border-solar-border text-solar-muted hover:text-white hover:border-slate-500 py-3 px-6 rounded-xl text-sm font-medium transition-all"
        >
          ← Voltar
        </button>
        <button
          onClick={onApprove}
          disabled={loading}
          className="flex-1 bg-solar-orange hover:bg-orange-500 text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-50"
        >
          Está ótimo — Aprovar →
        </button>
      </div>
    </div>
  )
}
