## ADDED Requirements

### Requirement: Admin pode configurar modelo para tipo de agente
O sistema SHALL permitir que administradores configurem qual modelo cada tipo de agente deve utilizar.

#### Scenario: Configurar modelo para agente
- **WHEN** admin seleciona um tipo de agente e um modelo cadastrado
- **THEN** sistema cria configuração em AgentModelConfig

#### Scenario: Atualizar modelo de agente
- **WHEN** admin altera o modelo de um agente já configurado
- **THEN** sistema atualiza a configuração e novas execuções usam o novo modelo

### Requirement: Apenas um modelo ativo por tipo de agente
O sistema SHALL garantir que apenas uma configuração ativa exista por tipo de agente.

#### Scenario: Criar segunda configuração ativa
- **WHEN** admin tenta criar configuração ativa para tipo que já tem
- **THEN** sistema desativa a configuração anterior automaticamente

### Requirement: Backend injeta modelo na chamada ao agente
O sistema SHALL passar o modelo configurado na requisição ao agente.

#### Scenario: Gerar conteúdo com modelo configurado
- **WHEN** queue processor executa geração de conteúdo
- **THEN** sistema busca configuração do agente, obtém o modelo e passa na requisição

### Requirement: Agente usa modelo da requisição
O sistema SHALL fazer o agente usar o modelo recebido na requisição.

#### Scenario: Agente recebe modelo na requisição
- **WHEN** agente recebe requisição com campo model
- **THEN** agente usa o modelo especificado em vez de ler do ENV

#### Scenario: Agente não recebe modelo (backward compatibility)
- **WHEN** agente recebe requisição sem campo model
- **THEN** agente usa modelo do ENV como fallback

## Data Model

### AgentModelConfig Entity
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| agentType | enum | Tipo do agente (CONTENT_GEN, PATH_GENERATOR, etc) |
| modelPriceId | UUID | FK para ModelPrice |
| isActive | boolean | Se está habilitado |
| createdAt | datetime | Data de criação |
| updatedAt | datetime | Data de atualização |

### AgentType Enum
- CONTENT_GEN
- PATH_GENERATOR
- TASK_ANALYZER
- PROJECT_ANALYZER
- SAFETY

## API Endpoints

- `GET /admin/agent-model-configs` - Listar configurações
- `POST /admin/agent-model-configs` - Criar configuração
- `PUT /admin/agent-model-configs/:id` - Atualizar configuração
- `DELETE /admin/agent-model-configs/:id` - Excluir configuração

## Fluxo de Execução

```
Queue Processor
    │
    ├─▶ 1. Busca AgentModelConfig por agentType
    │
    ├─▶ 2. Busca ModelPrice (nome + preços)
    │
    ├─▶ 3. Chama AgentsService com { ..., model: "gemini-3.1-pro" }
    │
    └─▶ 4. Grava TokenUsage com model + custo
```