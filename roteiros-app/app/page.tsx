'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import Sidebar from '@/components/Sidebar'
import BriefingForm from '@/components/BriefingForm'
import HookSelector from '@/components/HookSelector'
import ScriptViewer from '@/components/ScriptViewer'
import ScriptChat from '@/components/ScriptChat'
import ReviewPanel from '@/components/ReviewPanel'

export type Formato = 'reel-valor' | 'reel-institucional' | 'anuncio'
export type Funil = 'topo' | 'meio' | 'fundo'

export interface Briefing {
  tema: string
  formato: Formato
  funil: Funil
  framework: string
  duracaoMax: '30s' | '45s' | '60s' | '90s'
}

export interface Hook {
  id: string
  texto: string
  driver: string
  estrutura: string
  rationale: string
}

export interface StrategistBrief {
  nivelConsciencia: string
  framework: string
  driverDominante: string
  anguloEstrategico: string
  ctaRecomendado: string
  duracaoRecomendada: string
  cenarioSugerido: string
  hooks: Hook[]
}

export interface ScriptSection {
  nome: string
  tempo: string
  cena: string
  fala: string
  textoNaTela: string
  botao?: string
}

export interface Script {
  formato: string
  tema: string
  duracaoEstimada: string
  framework: string
  estagio?: string
  secoes: ScriptSection[]
  legenda?: string
  hashtags?: string[]
  direcaoAudio?: string
  copyDoAnuncio?: { headline: string; body: string; cta: string }
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  scriptUpdated?: boolean
}

export interface Review {
  pontuacaoGeral: number
  scores: { gancho: number; entrega: number; cta: number; adequacaoPublico: number; producao: number }
  pontosFortres: string[]
  melhorias: { dimensao: string; problema: string; correcao: string }[]
  checklist: Record<string, boolean>
  varianteAB: { gancho: string; driverPsicologico: string; hipoteseTestada: string; roteiro: string }
}

type Step = 'briefing' | 'hooks' | 'script' | 'chat' | 'review'

const STEPS: { id: Step; label: string; icon: string }[] = [
  { id: 'briefing',     label: 'Briefing',     icon: '📋' },
  { id: 'hooks',        label: 'Gancho',        icon: '🎯' },
  { id: 'script',       label: 'Roteiro',       icon: '✍️' },
  { id: 'chat',         label: 'Refinamento',   icon: '💬' },
  { id: 'review',       label: 'Revisão',       icon: '🔍' },
]

function MainApp() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [step, setStep] = useState<Step>('briefing')
  const [briefing, setBriefing] = useState<Briefing | null>(null)
  const [strategistBrief, setStrategistBrief] = useState<StrategistBrief | null>(null)
  const [chosenHook, setChosenHook] = useState<Hook | null>(null)
  const [script, setScript] = useState<Script | null>(null)
  const [review, setReview] = useState<Review | null>(null)
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null)
  const [currentScriptDbId, setCurrentScriptDbId] = useState<string | null>(null)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [chatLoading, setChatLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  const loadHistoricalScript = useCallback(async (id: string) => {
    setLoading(true)
    setLoadingMsg('Carregando roteiro...')
    const supabase = createClient()
    const { data } = await supabase.from('scripts').select('*').eq('id', id).single()
    if (data) {
      setBriefing({ tema: data.tema, formato: data.formato, funil: data.funil, framework: data.framework, duracaoMax: data.duracao_max })
      setStrategistBrief(data.strategic_brief)
      setChosenHook(data.chosen_hook)
      setScript(data.script)
      setReview(data.review)
      setSelectedHistoryId(id)
      setCurrentScriptDbId(id)
      setStep('review')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    const viewId = searchParams.get('view')
    if (viewId) loadHistoricalScript(viewId)
  }, [searchParams, loadHistoricalScript])

  async function handleBriefingSubmit(b: Briefing) {
    setBriefing(b)
    setError(null)
    setLoading(true)
    setLoadingMsg('🎯 Estrategista analisando o briefing e criando ganchos...')
    try {
      const res = await fetch('/api/strategist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(b),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setStrategistBrief(json.data)
      setStep('hooks')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  function handleEnterChat() {
    setChatHistory([])
    setStep('chat')
  }

  async function handleChatMessage(message: string) {
    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: message }]
    setChatHistory(newHistory)
    setError(null)
    setChatLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script,
          brief: strategistBrief,
          chosenHook,
          formato: briefing?.formato,
          userMessage: message,
          conversationHistory: chatHistory,
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: json.reply,
        scriptUpdated: !!json.updatedScript,
      }
      setChatHistory([...newHistory, assistantMsg])
      if (json.updatedScript) setScript(json.updatedScript)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido')
    } finally {
      setChatLoading(false)
    }
  }

  async function handleHookChosen(hook: Hook) {
    setChosenHook(hook)
    setError(null)
    setLoading(true)
    setLoadingMsg('✍️ Roteirista escrevendo o roteiro completo...')
    try {
      const res = await fetch('/api/scriptwriter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief: strategistBrief, chosenHook: hook.texto, formato: briefing?.formato, duracaoMax: briefing?.duracaoMax }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setScript(json.data)
      setStep('script')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  async function handleApproveScript() {
    setError(null)
    setLoading(true)
    setLoadingMsg('🔍 Revisor avaliando o roteiro e criando variante A/B...')
    try {
      const res = await fetch('/api/reviewer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script, brief: strategistBrief, formato: briefing?.formato }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setReview(json.data)

      // Salvar no Supabase
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: inserted } = await supabase.from('scripts').insert({
          user_id: user.id,
          tema: briefing!.tema,
          formato: briefing!.formato,
          funil: briefing!.funil,
          framework: strategistBrief!.framework,
          duracao_max: briefing!.duracaoMax,
          chosen_hook: chosenHook,
          strategic_brief: strategistBrief,
          script,
          review: json.data,
          status: 'completed',
        }).select('id').single()
        if (inserted) setCurrentScriptDbId(inserted.id)
      }

      setStep('review')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setStep('briefing')
    setBriefing(null)
    setStrategistBrief(null)
    setChosenHook(null)
    setScript(null)
    setReview(null)
    setChatHistory([])
    setError(null)
    setSelectedHistoryId(null)
    setCurrentScriptDbId(null)
    router.push('/')
  }

  function handleSelectScript(id: string) {
    router.push(`/?view=${id}`)
  }

  const currentStepIdx = STEPS.findIndex(s => s.id === step)

  return (
    <div className="min-h-screen flex bg-solar-dark">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-200 overflow-hidden shrink-0 fixed inset-y-0 left-0 z-20 lg:relative lg:z-auto`}>
        <Sidebar
          onSelectScript={handleSelectScript}
          selectedId={selectedHistoryId}
          onNewScript={handleReset}
        />
      </div>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-10 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="border-b border-solar-border bg-solar-card/50 backdrop-blur sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(o => !o)}
              className="text-solar-muted hover:text-white p-1.5 rounded-lg hover:bg-solar-border transition-all"
            >
              ☰
            </button>
            {/* Progress */}
            <div className="flex items-center gap-1 flex-1 overflow-x-auto scrollbar-hide">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center gap-1 shrink-0">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    i < currentStepIdx ? 'bg-green-900/40 text-green-400'
                      : i === currentStepIdx ? 'bg-solar-orange/20 text-solar-orange'
                      : 'text-solar-muted'
                  }`}>
                    <span>{s.icon}</span>
                    <span className="hidden sm:inline">{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && <div className={`w-4 h-px ${i < currentStepIdx ? 'bg-green-600' : 'bg-solar-border'}`} />}
                </div>
              ))}
            </div>
            <button onClick={handleReset}
              className="text-xs text-solar-muted hover:text-white px-3 py-1.5 rounded-lg hover:bg-solar-border transition-all shrink-0">
              + Novo
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
          {loading && (
            <div className="fixed inset-0 bg-solar-dark/80 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-solar-card border border-solar-border rounded-2xl p-8 max-w-sm w-full mx-4 text-center">
                <div className="w-12 h-12 border-2 border-solar-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-slate-300">{loadingMsg}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-900/30 border border-red-700 text-red-300 rounded-xl p-4 text-sm">
              ⚠️ {error}
            </div>
          )}

          {step === 'briefing' && <BriefingForm onSubmit={handleBriefingSubmit} />}
          {step === 'hooks' && strategistBrief && (
            <HookSelector brief={strategistBrief} onChoose={handleHookChosen} onBack={() => setStep('briefing')} />
          )}
          {step === 'script' && script && chosenHook && (
            <ScriptViewer
              script={script}
              chosenHook={chosenHook}
              onEnterChat={handleEnterChat}
              onApprove={handleApproveScript}
              onBack={() => setStep('hooks')}
            />
          )}
          {step === 'chat' && script && chosenHook && strategistBrief && briefing && (
            <ScriptChat
              script={script}
              chosenHook={chosenHook}
              brief={strategistBrief}
              formato={briefing.formato}
              chatHistory={chatHistory}
              loading={chatLoading}
              onSendMessage={handleChatMessage}
              onApprove={handleApproveScript}
              onBack={() => setStep('script')}
            />
          )}
          {step === 'review' && review && script && (
            <ReviewPanel review={review} script={script} scriptId={currentScriptDbId} onNewScript={handleReset} />
          )}
        </main>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-solar-dark flex items-center justify-center"><div className="w-8 h-8 border-2 border-solar-orange border-t-transparent rounded-full animate-spin" /></div>}>
      <MainApp />
    </Suspense>
  )
}
