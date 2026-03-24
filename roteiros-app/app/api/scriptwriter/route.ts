import Anthropic from '@anthropic-ai/sdk'
import { buildScriptwriterSystem } from '@/lib/prompts'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  const { brief, chosenHook, formato, duracaoMax } = await req.json()

  const formatoLabel = formato === 'reel-valor'
    ? `Instagram Reel de Valor (educativo orgânico, até ${duracaoMax === '45s' ? '45 segundos' : '30 segundos'})`
    : formato === 'reel-institucional'
    ? `Instagram Reel Institucional (conteúdo de marca, até ${duracaoMax === '60s' ? '60 segundos' : '45 segundos'})`
    : 'Anúncio Meta Ads (conversão, até 60 segundos)'

  const userMessage = `
Escreva o roteiro completo com base no seguinte brief estratégico e gancho escolhido:

**Tipo de conteúdo:** ${formatoLabel}
**Gancho escolhido (use EXATAMENTE este):** "${chosenHook}"

**Brief estratégico:**
- Framework/Formato: ${brief.framework}
- Driver dominante: ${brief.driverDominante}
- Ângulo estratégico: ${brief.anguloEstrategico}
- CTA recomendado: ${brief.ctaRecomendado}
- Duração recomendada: ${brief.duracaoRecomendada}
- Cenário sugerido: ${brief.cenarioSugerido}

Produza o roteiro completo no formato JSON especificado para ${formato === 'anuncio' ? 'ANUNCIO' : 'REEL'}.
`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      system: buildScriptwriterSystem(duracaoMax ?? '30s', formato ?? 'reel-valor'),
      messages: [{ role: 'user', content: userMessage }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('JSON não encontrado na resposta')
    const data = JSON.parse(jsonMatch[0])

    return Response.json({ success: true, data })
  } catch (error) {
    console.error('Scriptwriter error:', error)
    return Response.json({ success: false, error: 'Erro ao gerar roteiro' }, { status: 500 })
  }
}
