## Why

A página de detalhe do usuário (admin) exibe métricas brutas de token usage (Total Cost, Input/Output Tokens, Total Calls), mas não mostra métricas de eficiência por usuário. Adicionar "Avg/Subject" e "Avg/Call" dá ao admin uma visão rápida de quanto cada subject custa e qual o custo médio por chamada de agente para aquele usuário.

## What Changes

- Adicionar card "Avg/Subject" (`totalCostUsd / subjectsCount`) na grid de métricas do AdminUserDetailPage
- Adicionar card "Avg/Call" (`totalCostUsd / totalCalls`) na grid de métricas do AdminUserDetailPage
- Ambos os dados já existem na resposta do backend — mudança 100% frontend

## Capabilities

### New Capabilities
- `user-detail-avg-metrics`: Cards de métricas de custo médio por subject e por chamada na página de detalhe do usuário admin

### Modified Capabilities

(nenhuma)

## Impact

- `apps/web/src/pages/AdminUserDetailPage.tsx` — dois novos cards na grid de métricas
