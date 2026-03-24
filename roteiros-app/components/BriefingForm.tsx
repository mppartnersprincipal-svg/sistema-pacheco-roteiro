'use client'

import { useState } from 'react'
import type { Briefing, Formato, Funil } from '@/app/page'

interface Props {
  onSubmit: (briefing: Briefing) => void
}

const FORMATOS: { value: Formato; label: string; desc: string; icon: string }[] = [
  { value: 'reel-valor', label: 'Reel de Valor', desc: 'Educativo e orgânico — engaja, educa, gera salvamentos', icon: '💡' },
  { value: 'reel-institucional', label: 'Reel Institucional', desc: 'Marca e cultura — bastidores, equipe, valores', icon: '🏢' },
  { value: 'anuncio', label: 'Anúncio Meta Ads', desc: 'Conversão paga — leads, WhatsApp, orçamentos', icon: '🎯' },
]

const FUNIS: { value: Funil; label: string; desc: string }[] = [
  { value: 'topo', label: 'Topo — Atração', desc: 'Público frio, ainda não conhece a Pacheco' },
  { value: 'meio', label: 'Meio — Consideração', desc: 'Já conhece, está avaliando fornecedores' },
  { value: 'fundo', label: 'Fundo — Decisão', desc: 'Retargeting, lead quente, pronto para comprar' },
]

const FRAMEWORKS: { value: string; label: string; desc: string }[] = [
  { value: 'auto', label: 'IA decide', desc: 'O Estrategista escolhe o melhor para o contexto' },
  { value: 'PAS', label: 'PAS', desc: 'Problema → Agitação → Solução' },
  { value: 'AIDA', label: 'AIDA', desc: 'Atenção → Interesse → Desejo → Ação' },
  { value: 'BAB', label: 'BAB', desc: 'Before → After → Bridge (transformação)' },
  { value: '4Ps', label: '4Ps', desc: 'Promise → Picture → Proof → Push' },
  { value: 'Star-Story-Solution', label: 'Star-Story', desc: 'Personagem → História → Solução' },
]

const DURACOES_REEL_VALOR: { value: '30s' | '45s'; label: string; desc: string }[] = [
  { value: '30s', label: 'Até 30 segundos', desc: 'Ideal para alcance máximo e completion rate' },
  { value: '45s', label: 'Até 45 segundos', desc: 'Mais contexto — para tutoriais e listas' },
]

const DURACOES_REEL_INSTITUCIONAL: { value: '45s' | '60s'; label: string; desc: string }[] = [
  { value: '45s', label: 'Até 45 segundos', desc: 'Narrativa enxuta e impactante' },
  { value: '60s', label: 'Até 60 segundos', desc: 'Mais espaço para contar a história' },
]

const TEMAS_SUGERIDOS_VALOR = [
  'Como calcular o kit de fixação correto',
  'Erros comuns na instalação em telhado metálico',
  'Mito: estrutura mais barata economiza dinheiro',
  '3 coisas que todo integrador precisa checar antes de instalar',
  'Por que o Magnelis® resiste mais que o galvanizado',
  'Como evitar que a obra pare por falta de peça',
]

const TEMAS_SUGERIDOS_INSTITUCIONAL = [
  'Bastidores do estoque da Pacheco Solar',
  'Como nasceu a Pacheco Solar — história do Lucas',
  'A entrega que salvou uma obra em fazenda',
  'Nossa equipe de suporte técnico em ação',
  'Como preparamos o pedido até chegar na sua obra',
]

const TEMAS_SUGERIDOS_ANUNCIO = [
  'Falta de itens avulsos travando obra',
  'Resistência das estruturas para agronegócio',
  'Custo-benefício da linha de telhado',
  'Centralização de compras (solo + telhado)',
  'Pronta entrega — nunca atrasa obra',
  'Suporte técnico do pré-projeto à instalação',
]

export default function BriefingForm({ onSubmit }: Props) {
  const [tema, setTema] = useState('')
  const [formato, setFormato] = useState<Formato>('reel-valor')
  const [funil, setFunil] = useState<Funil>('topo')
  const [framework, setFramework] = useState('auto')
  const [duracaoMax, setDuracaoMax] = useState<'30s' | '45s' | '60s' | '90s'>('30s')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!tema.trim()) return
    onSubmit({ tema: tema.trim(), formato, funil, framework, duracaoMax })
  }

  function handleFormatoChange(f: Formato) {
    setFormato(f)
    if (f === 'reel-valor') setDuracaoMax('30s')
    else if (f === 'reel-institucional') setDuracaoMax('45s')
  }

  const temasSugeridos = formato === 'anuncio'
    ? TEMAS_SUGERIDOS_ANUNCIO
    : formato === 'reel-institucional'
    ? TEMAS_SUGERIDOS_INSTITUCIONAL
    : TEMAS_SUGERIDOS_VALOR

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Novo roteiro</h1>
        <p className="text-solar-muted text-sm">O Estrategista vai criar 3 opções de gancho para você escolher.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tipo de conteúdo */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-300">Tipo de conteúdo</label>
          <div className="grid grid-cols-1 gap-3">
            {FORMATOS.map(f => (
              <button key={f.value} type="button" onClick={() => handleFormatoChange(f.value)}
                className={`p-4 rounded-xl border text-left transition-all flex items-start gap-4 ${
                  formato === f.value ? 'border-solar-orange bg-solar-orange/10 text-white' : 'border-solar-border bg-solar-card text-solar-muted hover:border-slate-500'
                }`}>
                <div className="text-2xl mt-0.5">{f.icon}</div>
                <div>
                  <div className="text-sm font-medium">{f.label}</div>
                  <div className="text-xs mt-0.5 opacity-70">{f.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tema */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-300">Tema / Assunto do vídeo</label>
          <textarea
            value={tema}
            onChange={e => setTema(e.target.value)}
            placeholder="Ex: Como calcular o kit de fixação correto"
            rows={2}
            className="w-full bg-solar-card border border-solar-border rounded-xl px-4 py-3 text-sm text-white placeholder-solar-muted focus:outline-none focus:border-solar-orange transition-colors resize-none"
            required
          />
          <div className="flex flex-wrap gap-2">
            {temasSugeridos.map(t => (
              <button key={t} type="button" onClick={() => setTema(t)}
                className="text-xs px-3 py-1.5 rounded-full bg-solar-card border border-solar-border text-solar-muted hover:text-white hover:border-solar-orange transition-all">
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Duração (só para Reels) */}
        {formato === 'reel-valor' && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-300">Duração do Reel</label>
            <div className="grid grid-cols-2 gap-3">
              {DURACOES_REEL_VALOR.map(d => (
                <button key={d.value} type="button" onClick={() => setDuracaoMax(d.value)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    duracaoMax === d.value ? 'border-solar-orange bg-solar-orange/10 text-white' : 'border-solar-border bg-solar-card text-solar-muted hover:border-slate-500'
                  }`}>
                  <div className="text-sm font-medium">{d.label}</div>
                  <div className="text-xs mt-0.5 opacity-70">{d.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {formato === 'reel-institucional' && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-300">Duração do Reel</label>
            <div className="grid grid-cols-2 gap-3">
              {DURACOES_REEL_INSTITUCIONAL.map(d => (
                <button key={d.value} type="button" onClick={() => setDuracaoMax(d.value)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    duracaoMax === d.value ? 'border-solar-orange bg-solar-orange/10 text-white' : 'border-solar-border bg-solar-card text-solar-muted hover:border-slate-500'
                  }`}>
                  <div className="text-sm font-medium">{d.label}</div>
                  <div className="text-xs mt-0.5 opacity-70">{d.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Etapa do funil — só para Anúncios */}
        {formato === 'anuncio' && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-300">Etapa do funil</label>
            <div className="space-y-2">
              {FUNIS.map(f => (
                <button key={f.value} type="button" onClick={() => setFunil(f.value)}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all ${
                    funil === f.value ? 'border-solar-orange bg-solar-orange/10 text-white' : 'border-solar-border bg-solar-card text-solar-muted hover:border-slate-500'
                  }`}>
                  <div className="text-sm font-medium">{f.label}</div>
                  <div className="text-xs mt-0.5 opacity-70">{f.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Framework — só para Anúncios */}
        {formato === 'anuncio' && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-300">
              Framework de persuasão
              <span className="ml-2 text-xs font-normal text-solar-muted">(opcional — a IA escolhe se deixar em "IA decide")</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {FRAMEWORKS.map(fw => (
                <button key={fw.value} type="button" onClick={() => setFramework(fw.value)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    framework === fw.value ? 'border-solar-orange bg-solar-orange/10 text-white' : 'border-solar-border bg-solar-card text-solar-muted hover:border-slate-500'
                  }`}>
                  <div className="text-sm font-semibold">{fw.label}</div>
                  <div className="text-xs mt-0.5 opacity-70 leading-snug">{fw.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!tema.trim()}
          className="w-full bg-solar-orange hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors text-sm"
        >
          Gerar ganchos →
        </button>
      </form>
    </div>
  )
}
