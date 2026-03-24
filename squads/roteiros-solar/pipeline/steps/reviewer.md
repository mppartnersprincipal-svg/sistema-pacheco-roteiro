---
id: reviewer
type: step
execution: inline
model_tier: powerful
agent: reviewer
format: review
inputFile: squads/roteiros-solar/output/roteiro.md
outputFile: squads/roteiros-solar/output/revisao-final.md
---

# Etapa: Revisor

## Objetivo
Revisar o roteiro aprovado com scoring detalhado e entregar uma variante A/B otimizada.

## Input
- Roteiro aprovado: `inputFile`
- Brief estratégico: `squads/roteiros-solar/output/strategic-brief.md`
- Gancho escolhido: `squads/roteiros-solar/output/chosen-hook.md`
- Perfil da empresa: `_opensquad/_memory/company.md`

## Instruções

1. Leia o roteiro aprovado e o brief estratégico completo
2. Execute o Operational Framework do agente Revisor
3. Produza a revisão com scoring por dimensão
4. Identifique pelo menos 3 melhorias específicas e acionáveis
5. Produza a variante A/B completa com gancho diferente
6. Explique as diferenças estratégicas entre original e variante
7. Salve em `outputFile`

## Veto Conditions

- Revisão sem scoring numérico → adicionar
- Menos de 3 melhorias específicas → completar
- Variante A/B com mesmo gancho do original → reescrever com gancho diferente
- Checklist de qualidade incompleto → preencher todos os itens
