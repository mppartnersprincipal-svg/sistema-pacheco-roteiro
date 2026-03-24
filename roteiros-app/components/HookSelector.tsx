'use client'

import type { Hook, StrategistBrief } from '@/app/page'

interface Props {
  brief: StrategistBrief
  onChoose: (hook: Hook) => void
  onBack: () => void
}

export default function HookSelector({ brief, onChoose, onBack }: Props) {
  return (
    <div className="space-y-8">
      <div>
        <button onClick={onBack} className="text-xs text-solar-muted hover:text-white mb-4 flex items-center gap-1">
          ← Voltar ao briefing
        </button>
        <h2 className="text-2xl font-bold text-white mb-1">Escolha o gancho</h2>
        <p className="text-solar-muted text-sm">O Estrategista criou 3 opções. Escolha uma para o Roteirista escrever o vídeo completo.</p>
      </div>

      {/* Brief summary */}
      <div className="bg-solar-card border border-solar-border rounded-xl p-4 space-y-2">
        <div className="text-xs font-medium text-solar-orange uppercase tracking-wide mb-3">Brief estratégico</div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-solar-muted">Framework:</span>
            <span className="text-white ml-2 font-medium">{brief.framework}</span>
          </div>
          <div>
            <span className="text-solar-muted">Driver:</span>
            <span className="text-white ml-2 font-medium">{brief.driverDominante.split('(')[0].trim()}</span>
          </div>
          <div>
            <span className="text-solar-muted">Duração:</span>
            <span className="text-white ml-2">{brief.duracaoRecomendada}</span>
          </div>
          <div>
            <span className="text-solar-muted">Cenário:</span>
            <span className="text-white ml-2">{brief.cenarioSugerido}</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-solar-border text-xs text-slate-400">
          {brief.anguloEstrategico}
        </div>
      </div>

      {/* Hooks */}
      <div className="space-y-3">
        {brief.hooks.map((hook, i) => (
          <div
            key={hook.id}
            className="bg-solar-card border border-solar-border rounded-xl p-5 hover:border-solar-orange transition-all group cursor-pointer"
            onClick={() => onChoose(hook)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-solar-orange bg-solar-orange/10 px-2 py-0.5 rounded">
                    Hook {hook.id}
                  </span>
                  <span className="text-xs text-solar-muted">{hook.estrutura}</span>
                </div>

                <p className="text-white font-semibold text-lg leading-snug">
                  "{hook.texto}"
                </p>

                <div className="space-y-1">
                  <div className="text-xs text-solar-muted">
                    <span className="font-medium text-slate-400">Driver: </span>
                    {hook.driver}
                  </div>
                  <div className="text-xs text-slate-500 italic">{hook.rationale}</div>
                </div>
              </div>

              <button
                onClick={e => { e.stopPropagation(); onChoose(hook) }}
                className="shrink-0 bg-solar-orange/0 group-hover:bg-solar-orange text-solar-orange group-hover:text-white border border-solar-orange/40 group-hover:border-solar-orange px-4 py-2 rounded-lg text-xs font-semibold transition-all"
              >
                Usar este →
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center text-xs text-solar-muted">
        Não gostou de nenhum?{' '}
        <button onClick={onBack} className="text-solar-orange hover:underline">
          Mude o briefing
        </button>{' '}
        ou escolha o mais próximo e ajuste depois.
      </div>
    </div>
  )
}
