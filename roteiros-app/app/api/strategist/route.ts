import Anthropic from '@anthropic-ai/sdk'
import { buildStrategistSystem } from '@/lib/prompts'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  const { tema, formato, funil, framework } = await req.json()

  const formatoLabel = formato === 'reel-valor'
    ? 'Instagram Reel de Valor (conteúdo educativo orgânico, 15–45 segundos)'
    : formato === 'reel-institucional'
    ? 'Instagram Reel Institucional (conteúdo de marca, 15–60 segundos)'
    : 'Anúncio Meta Ads (conversão, até 60 segundos)'

  const funilLine = formato === 'anuncio'
    ? `**Etapa do funil:** ${funil === 'topo' ? 'Topo — Atração (público frio)' : funil === 'meio' ? 'Meio — Consideração' : 'Fundo — Decisão / Retargeting'}`
    : ''

  const userMessage = `
Crie o brief estratégico para o seguinte roteiro:

**Tema:** ${tema}
**Tipo de conteúdo:** ${formatoLabel}
${funilLine}

Gere o brief estratégico completo com 3 opções de gancho no formato JSON especificado.
`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: buildStrategistSystem(framework ?? 'auto', formato),
      messages: [{ role: 'user', content: userMessage }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('JSON não encontrado na resposta')
    const data = JSON.parse(jsonMatch[0])

    return Response.json({ success: true, data })
  } catch (error) {
    console.error('Strategist error:', error)
    return Response.json({ success: false, error: 'Erro ao gerar brief estratégico' }, { status: 500 })
  }
}
