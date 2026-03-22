## Context

A AdminUserDetailPage já recebe `user.subjectsCount` e `tokenUsage.totalCalls` / `tokenUsage.totalCostUsd` do endpoint `GET /admin/users/:id`. Nenhuma alteração de backend necessária.

## Goals / Non-Goals

**Goals:**
- Exibir card "Avg/Subject" com `totalCostUsd / subjectsCount`
- Exibir card "Avg/Call" com `totalCostUsd / totalCalls`

**Non-Goals:**
- Alterar backend ou adicionar campos ao endpoint
- Criar componentes separados (segue padrão inline dos cards existentes)

## Decisions

- **Posição**: Após os 4 cards existentes (Total Cost, Input Tokens, Output Tokens, Total Calls)
- **Ícones**: `BookOpen` (já importado) para Avg/Subject, `Activity` para Avg/Call — diferenciam visualmente das métricas brutas
- **Guard contra zero**: Divisão segura com ternário (se divisor === 0, exibe 0)
- **Formatação**: `formatCurrency()` existente (4 casas decimais)

## Risks / Trade-offs

- Nenhum risco — mudança isolada, dados já disponíveis
