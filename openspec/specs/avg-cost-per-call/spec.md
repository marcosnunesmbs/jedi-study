# Average Cost Per Call Specification

## Purpose
Card de custo médio por chamada na página global de Token Usage.

## Scope
O que está **incluído** nessa spec:
- Exibição do custo médio por chamada na página de Token Usage

O que está **fora do escopo**:
- Métricas por usuário (coberto em user-detail-avg-metrics)

## Requirements

### Requirement: Token Usage page displays average cost per call
O sistema SHALL exibir na página de Token Usage um card com o custo médio por chamada de agente, calculado como `totalCostUsd / totalCalls`.

#### Scenario: Display avg cost per call with existing data
- **WHEN** admin acessa a página de Token Usage e existem chamadas registradas
- **THEN** o sistema exibe card "Avg/Call" com o valor `totalCostUsd / totalCalls` formatado como moeda

#### Scenario: Display avg cost per call with no data
- **WHEN** admin acessa a página de Token Usage e não há chamadas registradas (totalCalls = 0)
- **THEN** o sistema exibe card "Avg/Call" com valor zero formatado como moeda
