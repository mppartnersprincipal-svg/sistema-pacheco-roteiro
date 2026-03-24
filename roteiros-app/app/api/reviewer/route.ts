import Anthropic from '@anthropic-ai/sdk'
import { REVIEWER_SYSTEM } from '@/lib/prompts'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  const { script, brief, formato } = await req.json()

  const roteiroPretty = script.secoes
    ?.map((s: { nome: string; fala: string; textoNaTela: string }) =>
      `[${s.nome}]\nFala: ${s.fala}\nTexto na tela: ${s.textoNaTela}`
    )
    .join('\n\n') ?? JSON.stringify(script)

  const userMessage = `
Revise o seguinte roteiro da PachecoSolar e forneça o feedback e variante A/B.

**Formato:** ${formato === 'reel' ? 'Instagram Reel' : 'Anúncio Meta Ads'}
**Framework usado:** ${brief.framework}
**Driver psicológico original:** ${brief.driverDominante}

**Roteiro a revisar:**
${roteiroPretty}

**Legenda:** ${script.legenda ?? 'N/A'}

Produza a revisão completa com scoring, melhorias e variante A/B no formato JSON especificado.
`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      system: REVIEWER_SYSTEM,
      messages: [{ role: 'user', content: userMessage }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('JSON não encontrado na resposta')
    const data = JSON.parse(jsonMatch[0])

    return Response.json({ success: true, data })
  } catch (error) {
    console.error('Reviewer error:', error)
    return Response.json({ success: false, error: 'Erro ao revisar roteiro' }, { status: 500 })
  }
}
