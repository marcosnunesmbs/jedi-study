## ADDED Requirements

### Requirement: Admin pode cadastrar modelo de IA
O sistema SHALL permitir que administradores cadastrem modelos de IA com nome, provedor e preços por 1M de tokens.

#### Scenario: Cadastro de modelo válido
- **WHEN** admin envia dados válidos (name, provider, inputPricePer1M, outputPricePer1M)
- **THEN** sistema cria registro em ModelPrice e retorna o modelo criado

#### Scenario: Cadastro com nome duplicado
- **WHEN** admin tenta cadastrar modelo com nome que já existe
- **THEN** sistema retorna erro 400 indicando nome duplicado

### Requirement: Admin pode listar modelos cadastrados
O sistema SHALL listar todos os modelos cadastrados, com opção de filtrar por ativo/inativo.

#### Scenario: Listar todos os modelos
- **WHEN** admin solicita listagem de modelos
- **THEN** sistema retorna array com todos os modelos cadastrados

#### Scenario: Listar apenas modelos ativos
- **WHEN** admin solicita listagem com filtro isActive=true
- **THEN** sistema retorna apenas modelos onde isActive=true

### Requirement: Admin pode atualizar modelo
O sistema SHALL permitir atualização de preços e status de modelos existentes.

#### Scenario: Atualizar preços de modelo
- **WHEN** admin envia novos preços para modelo existente
- **THEN** sistema atualiza os preços e retorna modelo atualizado

#### Scenario: Desativar modelo
- **WHEN** admin define isActive=false para modelo
- **THEN** modelo não aparece em listagens padrão mas permanece em histórico

### Requirement: Admin pode excluir modelo
O sistema SHALL permitir exclusão de modelos, apenas se não estiverem em uso.

#### Scenario: Excluir modelo não utilizado
- **WHEN** admin tenta excluir modelo que não está em uso
- **THEN** sistema remove o registro e retorna sucesso

#### Scenario: Excluir modelo em uso
- **WHEN** admin tenta excluir modelo que está configurado em AgentModelConfig
- **THEN** sistema retorna erro 400 indicando que modelo está em uso

## Data Model

### ModelPrice Entity
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| name | string | Nome do modelo (ex: gemini-3.1-pro) |
| provider | string | Provedor (ex: google) |
| inputPricePer1M | float | Preço por 1M tokens de input |
| outputPricePer1M | float | Preço por 1M tokens de output |
| isActive | boolean | Se está disponível para uso |
| createdAt | datetime | Data de criação |
| updatedAt | datetime | Data de atualização |

## API Endpoints

- `GET /admin/model-prices` - Listar modelos
- `POST /admin/model-prices` - Criar modelo
- `PUT /admin/model-prices/:id` - Atualizar modelo
- `DELETE /admin/model-prices/:id` - Excluir modelo