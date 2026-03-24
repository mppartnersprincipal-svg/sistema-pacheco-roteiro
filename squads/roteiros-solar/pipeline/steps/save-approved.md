---
id: save-approved
type: step
execution: inline
model_tier: standard
outputFile: _opensquad/_memory/roteiros-aprovados.md
---

# Etapa: Salvar Roteiro Aprovado

## Objetivo
Registrar o roteiro aprovado na biblioteca cumulativa de referência dos agentes.

## Input
- Roteiro aprovado: `squads/roteiros-solar/output/roteiro.md`
- Brief estratégico: `squads/roteiros-solar/output/strategic-brief.md`
- Revisão final: `squads/roteiros-solar/output/revisao-final.md`
- Biblioteca atual: `_opensquad/_memory/roteiros-aprovados.md`

## Instruções

1. Leia o roteiro aprovado, o brief estratégico e a revisão final
2. Extraia os metadados: tipo de conteúdo, formato, gancho utilizado, score do revisor
3. Abra o arquivo `_opensquad/_memory/roteiros-aprovados.md`
4. **Adicione** (não substitua) uma nova entrada no final do arquivo, com a seguinte estrutura:

```
---

## Roteiro Aprovado — [DATA ATUAL] | [TIPO: Reel de Valor / Reel Institucional / Meta Ads]

**Formato:** [ex: Quick Tip / Storytelling / PAS / etc.]
**Gancho:** "[gancho exato utilizado]"
**Score Revisor:** [nota geral ou por dimensão, se disponível]

### Roteiro

[conteúdo completo do roteiro aprovado, exatamente como foi gerado]

### Legenda

[legenda do roteiro]
```

5. Salve o arquivo `_opensquad/_memory/roteiros-aprovados.md` com a nova entrada **acrescentada ao final**

## Regras Críticas

- **NUNCA sobrescreva** o arquivo inteiro — sempre acrescente ao final
- Preserve todas as entradas anteriores intactas
- Se o arquivo não existir, crie-o com o cabeçalho padrão antes de adicionar a entrada
- A data deve ser no formato DD/MM/AAAA
- Mantenha o roteiro fiel ao original aprovado — sem edições ou resumos
