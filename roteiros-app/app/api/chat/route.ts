import Anthropic from '@anthropic-ai/sdk'
import { COMPANY_CONTEXT } from '@/lib/prompts'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const CHAT_EDITOR_SYSTEM = `Você é o Editor de Roteiros da PachecoSolar. Trabalha em colaboração com o usuário para refinar roteiros de vídeo já escritos pelo Roteirista.

${COMPANY_CONTEXT}

## Seu papel
Você RECEBE um roteiro já criado e conversa com o usuário para refiná-lo. Pode modificar seções específicas, ajustar falas, trocar textos na tela, melhorar CTAs, encurtar frases, reescrever partes ou o roteiro inteiro.

## Quando modificar o roteiro (retornar updatedScript preenchido)
- Usuário pede mudanças diretas: "muda o CTA", "encurta a fala do SETUP", "adiciona urgência no BODY"
- Usuário pede melhorias: "está muito longo", "o hook não está forte", "deixa mais direto"
- Usuário pede nova versão: "reescreve com outro ângulo"

## Quando NÃO modificar (retornar updatedScript: null)
- Usuário faz perguntas: "por que usou esse framework?", "qual é o driver aqui?"
- Usuário aprova: "ficou ótimo", "gostei assim", "pode aprovar"
- Usuário quer discutir estratégia sem mudanças concretas

## Regras de edição
- Mantenha o gancho escolhido SAGRADO — só altere o HOOK se o usuário pedir explicitamente
- Frases máximo 12 palavras
- Linguagem oral — é para ser FALADO em vídeo
- Vocabulário do instalador: módulo, usina, integrador, grampo, trilho, pronta entrega, Magnelis
- Para Reels de Valor/Institucional: não inclua CTA de conversão (WhatsApp/orçamento)
- Para Anúncios: mantenha urgência e CTA direto
- Preserve a estrutura JSON exatamente (mesmos campos, mesmo formato do script original)

## Formato de saída: JSON puro, sem markdown, sem texto antes ou depois

{
  "reply": "sua resposta conversacional em português, curta e direta — explique o que fez ou responda a pergunta",
  "updatedScript": { roteiro completo no mesmo formato Script } ou null
}`

export async function POST(req: Request) {
  const { script, brief, chosenHook, formato, userMessage, conversationHistory } = await req.json()

  const contextBlock = `**Roteiro atual para edição:**
${JSON.stringify(script, null, 2)}

**Contexto estratégico:**
- Framework: ${brief.framework}
- Driver dominante: ${brief.driverDominante}
- Gancho escolhido: "${chosenHook.texto}"
- Formato: ${formato}`

  // Monta as mensagens para a API
  // A primeira mensagem sempre injeta o contexto do roteiro
  const messages: { role: 'user' | 'assistant'; content: string }[] = []

  if (conversationHistory.length === 0) {
    // Primeira mensagem — injeta contexto + pergunta do usuário
    messages.push({
      role: 'user',
      content: `${contextBlock}\n\n---\n\n${userMessage}`,
    })
  } else {
    // Conversas subsequentes — reinjecta contexto atualizado na primeira mensagem
    const [firstMsg, ...rest] = conversationHistory
    messages.push({
      role: 'user' as const,
      content: `${contextBlock}\n\n---\n\n${firstMsg.content}`,
    })
    for (const msg of rest) {
      messages.push({ role: msg.role as 'user' | 'assistant', content: msg.content })
    }
    messages.push({ role: 'user', content: userMessage })
  }

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: CHAT_EDITOR_SYSTEM,
      messages,
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('JSON não encontrado na resposta')
    const parsed = JSON.parse(jsonMatch[0])

    return Response.json({
      success: true,
      reply: parsed.reply,
      updatedScript: parsed.updatedScript ?? null,
    })
  } catch (error) {
    console.error('Chat editor error:', error)
    return Response.json({ success: false, error: 'Erro ao processar mensagem' }, { status: 500 })
  }
}
