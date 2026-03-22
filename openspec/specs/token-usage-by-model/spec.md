## ADDED Requirements

### Requirement: Resumo de uso inclui agrupamento por modelo
O sistema SHALL incluir no resumo de token usage um agrupamento por modelo utilizado.

#### Scenario: Visualizar resumo com uso por modelo
- **WHEN** admin acessa página de Token Usage
- **THEN** sistema retorna resumo incluindo byModel com somatório por modelo

### Requirement: Card de uso por modelo
O sistema SHALL exibir cards de uso por modelo similares aos cards de uso por agente.

#### Scenario: Exibir cards por modelo
- **WHEN** existem registros de uso no sistema
- **THEN** sistema exibe cards mostrando: calls, inputTokens, outputTokens, totalTokens, totalCostUsd por modelo

### Requirement: Modelo presente em todos os registros
O sistema SHALL garantir que todo registro de TokenUsage tenha o nome do modelo preenchido.

#### Scenario: Registro sem modelo
- **WHEN** agente registra uso sem informar modelo
- **THEN** sistema usa nome do modelo do ENV como fallback

## Response Format

```typescript
interface TokenUsageSummary {
  totalCalls: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCostUsd: number;
  totalUsers: number;
  averageCostPerUser: number;
  byAgent: Record<string, AgentUsageStats>;
  byModel: Record<string, ModelUsageStats>;  // NOVO
}

interface ModelUsageStats {
  calls: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  totalCostUsd: number;
}
```

## UI Components

### ModelUsageCard
- Semelhante ao AgentUsageCard existente
- Exibe nome do modelo como título
- Mostra número de chamadas
- Exibe breakdown de tokens (input/output/total)
- Exibe custo total

### Página Token Usage
- Manter cards existentes (Total Cost, Active Users, Avg/User, Total Tokens)
- Manter seção "Usage by Agent"
- Adicionar nova seção "Usage by Model"