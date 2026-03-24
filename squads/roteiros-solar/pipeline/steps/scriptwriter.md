---
id: scriptwriter
type: step
execution: subagent
model_tier: powerful
agent: scriptwriter
format: instagram-reels
inputFile: squads/roteiros-solar/output/strategic-brief.md
inputFile2: squads/roteiros-solar/output/chosen-hook.md
outputFile: squads/roteiros-solar/output/roteiro.md
---

# Etapa: Roteirista

## Objetivo
Escrever o roteiro completo usando o gancho escolhido pelo usuário e o brief estratégico.

## Input
- Brief estratégico: `inputFile`
- Gancho escolhido: `inputFile2`
- Perfil da empresa: `_opensquad/_memory/company.md`
- Roteiros de referência: `_opensquad/_memory/Roteiros.pdf` (use como referência de tom e estilo)
- Cronograma aprovado (Março 2026): `_opensquad/_memory/CRONOGRAMA_PACHECO_SOLAR_MARCO_2026_FINAL.pdf` (roteiros reais aprovados pelo cliente — use como balizador de estrutura, tom e padrão de qualidade)
- Biblioteca de aprovados: `_opensquad/_memory/roteiros-aprovados.md` (roteiros gerados e aprovados pelo usuário em sessões anteriores — priorize esses padrões, pois representam o que já funcionou na prática)

## Instruções

1. Leia o brief estratégico e o gancho escolhido
2. Leia o perfil da empresa para absorver o tom de voz e dados concretos
3. Use os roteiros de referência da PachecoSolar como balizador de estilo
4. Execute o Operational Framework completo do agente Roteirista
5. Escreva o roteiro completo no formato correto para o formato selecionado (Reel ou Anúncio)
6. Salve em `outputFile`

## Veto Conditions

- Gancho diferente do que foi escolhido pelo usuário → corrigir
- Reel com mais de 30 segundos estimados → encurtar
- Anúncio sem texto na tela (on-screen text) → adicionar
- CTA genérico ("fale com a gente") → tornar específico
- Frase com mais de 15 palavras → dividir
- Legenda sem hook nos primeiros 125 chars → corrigir
