# Token Usage Specification

## Purpose
Monitoramento de consumo de tokens das APIs de Inteligência Artificial e estimativa de custos.

## Scope
O que está **incluído** nessa spec:
- Listagem de registros de consumo de tokens com filtros
- Obtenção do resumo geral de consumo e custos

O que está **fora do escopo**:
- Faturamento do usuário final (billing)

## Requirements

### Requirement: List Token Usage
The system MUST provide a paginated list of token usage records, allowing filtering by agent type and date range.

#### Scenario: Listagem com filtros
- GIVEN um administrador ou usuário com permissão
- WHEN solicita os registros de consumo com filtros (agentType, from, to)
- THEN o sistema retorna os registros que correspondem aos critérios especificados
- AND inclui detalhes de tokens de input e output

### Requirement: Get Token Usage Summary
The system MUST provide a summarized view of token usage and estimated costs.

#### Scenario: Resumo geral
- GIVEN um administrador ou usuário com permissão
- WHEN solicita o resumo de consumo
- THEN o sistema retorna o total de tokens consumidos (input/output) e o custo estimado com base nas configurações do ambiente
