## Context

O sistema atual tem uma tabela `TokenUsage` que registra todas as chamadas aos agentes de IA, incluindo `userId`, `agentType`, `inputTokens`, `outputTokens`, `estimatedCostUsd`. O endpoint atual `/admin/token-usage/summary` já retorna agregação por agente, mas não há como ver o consumo por usuário individual.

A página de Admin Users existente lista usuários sem informações de consumo de tokens.

## Goals / Non-Goals

**Goals:**
- Criar endpoint para buscar detalhes de um usuário incluindo seu consumo de tokens
- Exibir breakdown por agente (PATH_GENERATOR, CONTENT_GEN, TASK_ANALYZER, PROJECT_ANALYZER, SAFETY)
- Criar página de detalhes do usuário no frontend

**Non-Goals:**
- Modificar a tabela TokenUsage (já existe e tem os dados necessários)
- Criar endpoint para listar todos os usuários com seus custos (isso seria uma extensão futura)

## Decisões

1. **Endpoint único com token usage** - Decidimos criar um único endpoint `GET /admin/users/:id` que retorna tanto os dados do usuário quanto seu consumo de tokens. Isso evita múltiplas chamadas e mantém a coesão dos dados do usuário.

2. **Agregação no serviço** - A agregação de tokens por usuário será feita no `TokenUsageService` usando queries SQL agrupadas, em vez de buscar todos os registros e agregar em memória. Isso é mais eficiente para grandes volumes.

3. **Breakdown por agente no mesmo endpoint** - O `byAgent` será retornado junto com os totais do usuário, permitindo exibir tanto a visão macro quanto o detalhe por agente.

## Risks / Trade-offs

- [Risco] Queries complexas com JOINs → Mitigação: Usar queries simples com GROUP BY no repositório
- [Risco] Muitos registros em TokenUsage podem deixar a query lenta → Mitigação: Adicionar índices em userId e agentType (já existem)