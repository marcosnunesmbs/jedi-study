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
- GIVEN um administrador autenticado
- WHEN solicita os registros de consumo com filtros opcionais (agentType, from, to, limit, offset)
- THEN o sistema retorna os registros que correspondem aos critérios especificados
- AND inclui detalhes de tokens de input, output e custo estimado em USD por registro

#### Scenario: Acesso bloqueado para não-admin
- GIVEN um usuário autenticado sem role ADMIN
- WHEN tenta acessar os endpoints de token usage
- THEN o sistema retorna HTTP 403 Forbidden

### Requirement: Get Token Usage Summary
The system MUST provide a summarized view of token usage and estimated costs, aggregated by agent type.

#### Scenario: Resumo geral
- GIVEN um administrador autenticado
- WHEN solicita o resumo de consumo
- THEN o sistema retorna o total de chamadas, tokens (input/output) e custo estimado em USD
- AND agrega os dados por tipo de agente (PATH_GENERATOR, CONTENT_GEN, TASK_ANALYZER, PROJECT_ANALYZER)

### Requirement: Automatic Cost Recording
The system MUST automatically record token usage and estimated cost after every call to the AI Agents Service.

#### Scenario: Registro automático após geração
- GIVEN qualquer operação assíncrona que chame o Agents Service (geração de path, conteúdo ou análise de task)
- WHEN o agente retorna com sucesso incluindo metadados de uso
- THEN o sistema registra inputTokens, outputTokens, totalTokens e estimatedCostUsd vinculados ao userId e ao recurso gerado
- AND o custo é calculado com base nas variáveis de ambiente `GEMINI_COST_INPUT_1M` e `GEMINI_COST_OUTPUT_1M`
