## Why

A página de Token Usage exibe métricas agregadas (Total Cost, Active Users, Avg/User, Total Tokens), mas não mostra a eficiência por chamada. O campo `totalCalls` já é retornado pelo backend — basta calcular `totalCostUsd / totalCalls` e exibir num novo card.

## What Changes

- Adicionar um card "Avg/Call" na seção de Metric Cards da TokenUsagePage
- O cálculo é puramente frontend: `totalCostUsd / totalCalls` (com guard para divisão por zero)
- Nenhuma alteração de backend necessária

## Capabilities

### New Capabilities
- `avg-cost-per-call`: Card de métrica mostrando custo médio por chamada de agente na página de Token Usage

### Modified Capabilities

(nenhuma — o dado já existe no endpoint)

## Impact

- `apps/web/src/pages/TokenUsagePage.tsx` — novo card na grid de métricas
