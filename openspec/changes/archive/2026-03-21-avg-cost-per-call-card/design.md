## Context

A TokenUsagePage já exibe 4 cards de métricas (Total Cost, Active Users, Avg/User, Total Tokens). O endpoint `GET /token-usage/summary` já retorna `totalCalls` e `totalCostUsd`, então o cálculo do custo médio por chamada é puramente frontend.

## Goals / Non-Goals

**Goals:**
- Exibir card "Avg/Call" com `totalCostUsd / totalCalls` na grid de métricas

**Non-Goals:**
- Alterar o backend ou adicionar novos campos ao summary
- Criar componente separado para o card (segue o padrão inline dos demais)

## Decisions

- **Posição do card**: Entre "Avg/User" e "Total Tokens" — agrupa as duas métricas de média juntas
- **Ícone**: Usar `Activity` do lucide-react para diferenciar visualmente do "Avg/User" (que usa `Zap`)
- **Formatação**: Usar `formatCurrency()` existente (já exibe 4 casas decimais, adequado para valores pequenos)
- **Guard contra zero**: Se `totalCalls === 0`, exibir `$0.0000`

## Risks / Trade-offs

- Nenhum risco relevante — mudança isolada em um único componente, sem efeitos colaterais
