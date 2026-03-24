---
id: strategist
type: step
execution: subagent
model_tier: powerful
agent: strategist
format: copywriting
inputFile: squads/roteiros-solar/output/briefing.md
outputFile: squads/roteiros-solar/output/strategic-brief.md
---

# Etapa: Estrategista

## Objetivo
Produzir o brief estratégico completo com 3 opções de gancho para o usuário escolher.

## Input
Leia o arquivo de briefing: `inputFile`

## Instruções

1. Leia o briefing do usuário (tema, formato, etapa do funil)
2. Leia o perfil da empresa em `_opensquad/_memory/company.md`
3. Execute o Operational Framework completo do agente Estrategista
4. Produza o brief estratégico no formato de output do agente
5. Salve em `outputFile`

## Veto Conditions

- Tipo de conteúdo não identificado (Anúncio / Reel de Valor / Reel Institucional) → definir antes de qualquer outra coisa
- Anúncio sem identificação de nível de consciência → reescrever
- Reel de Valor com framework de anúncio (PAS/BAB/urgência) → corrigir para Hook→Valor→CTA
- Reel de Valor com produto mencionado nos primeiros 3s dos ganchos → reescrever hooks
- Menos de 3 opções de gancho → completar
- 3 ganchos com o mesmo driver psicológico → diversificar
- CTA de conversão ("Fale no WhatsApp") em Reel de Valor → substituir por CTA de engajamento
- Dados inventados não presentes no company.md → remover ou substituir
