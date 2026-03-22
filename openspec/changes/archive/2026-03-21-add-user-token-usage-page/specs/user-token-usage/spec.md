## ADDED Requirements

### Requirement: Admin can view user token usage details
O sistema DEVE permitir que administradores visualizem o consumo de tokens de IA de um usuário específico, incluindo totais agregados e breakdown por agente.

#### Scenario: Admin fetches user details with token usage
- **WHEN** admin acessa `GET /admin/users/:id`
- **THEN** sistema retorna dados do usuário + tokenUsage com totalInputTokens, totalOutputTokens, totalCalls, totalCostUsd, byAgent

#### Scenario: Admin views user token breakdown by agent
- **WHEN** admin visualiza os detalhes do usuário
- **THEN** sistema exibe para cada agente: costUsd, inputTokens, outputTokens, calls

### Requirement: User token usage includes all agent types
O sistema DEVE incluir no breakdown todos os agentes: PATH_GENERATOR, CONTENT_GEN, TASK_ANALYZER, PROJECT_ANALYZER, SAFETY.

#### Scenario: User has used multiple agents
- **WHEN** usuário tem registros de múltiplos agentes
- **THEN** sistema exibe cada agente separadamente com suas métricas

#### Scenario: User has not used any agent
- **WHEN** usuário não tem registros de token usage
- **THEN** sistema retorna zeros para todos os campos

### Requirement: Token usage data is accurate
O sistema DEVE calcular corretamente as somas de tokens e custos a partir dos registros existentes na tabela TokenUsage.

#### Scenario: Calculate total tokens correctly
- **WHEN** sistema agrega tokens de um usuário
- **THEN** soma de inputTokens e outputTokens deve corresponder aos valores armazenados

#### Scenario: Calculate cost correctly
- **WHEN** sistema calcula custo total do usuário
- **THEN** soma de estimatedCostUsd deve corresponder ao custo real