## MODIFIED Requirements

### Requirement: Admin pode configurar modelo para tipo de agente
O sistema SHALL permitir que administradores configurem qual modelo cada tipo de agente deve utilizar, incluindo o novo tipo TASK_GENERATOR.

#### Scenario: Configurar modelo para agente
- **WHEN** admin seleciona um tipo de agente e um modelo cadastrado
- **THEN** sistema cria configuração em AgentModelConfig

#### Scenario: Tipos de agente disponíveis
- **WHEN** admin visualiza a lista de tipos de agente
- **THEN** o sistema MUST listar: CONTENT_GEN, PATH_GENERATOR, TASK_ANALYZER, TASK_GENERATOR, SAFETY
- **AND** PROJECT_ANALYZER MUST NOT aparecer na lista
