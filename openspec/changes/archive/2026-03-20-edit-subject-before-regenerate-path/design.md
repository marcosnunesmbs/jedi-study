## Context

O sistema atual permite criar subjects e gerar study paths, mas não permite editar os dados do subject antes de regenerar o path. O fluxo atual:

1. Usuário clica em "Regenerate Path"
2. Modal de confirmação aparece (apenas warning)
3. Sistema gera novo path usando dados existentes do subject

O objetivo é adicionar uma etapa de edição entre o clique e a geração.

## Goals / Non-Goals

**Goals:**
- Permitir edição de título, skillLevel e goals antes de regenerar o path
- Validar os dados editados com o safety check (título + goals)
- Manter o histórico de tokens de todas as regenerações

**Non-Goals:**
- Não alterar o fluxo de criação inicial de subject
- Não permitir edição de subjects que não pertencem ao usuário
- Não adicionar versionamento de subject (apenas study path tem version)

## Decisions

### 1. Modal de edição vs página separada
**Decisão:** Usar modal de edição integrado ao modal de "Regenerate Path" existente

**Alternativas consideradas:**
- Página separada de edição → Requer mais navegação, mais código
- Modal separado antes do regenerate → Mais cliques para o usuário

**Rationale:** O usuário já está no fluxo de regeneração. O modal existente pode ser expandido para incluir os campos editáveis, mantendo a experiência fluida.

### 2. Validação de segurança
**Decisão:** Validar título E goals no safety check

**Alternativa considerada:**
- Validar apenas título → Goals podem conter conteúdo impróprio

**Rationale:** Os goals são inputs do usuário e podem conter texto malicioso. O safety check deve validar ambos.

### 3. Ordem das operações
**Decisão:** PATCH subject primeiro, depois POST generate

**Alternativa considerada:**
- Enviar tudo junto para generate → Acoplamento desnecessário

**Rationale:** Separação de responsabilidades. O subject é atualizado independentemente do path generation.

## Risks / Trade-offs

- **[Risco]** Usuário edita goals para绕过 safety check
  - **Mitigação:** Goals são validados no safety check antes da geração do path

- **[Risco]** Perda de dados se o usuário fechar o modal sem salvar
  - **Mitigação:** Os campos são preenchidos com valores atuais, nenhuma perda de dados

- **[Trade-off]** Modal pode ficar grande com muitos campos
  - **Mitigação:** Goals podem ser editados como texto simples (comma-separated), não uma lista complexa