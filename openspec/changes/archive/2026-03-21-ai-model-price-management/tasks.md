## 1. Backend - Entidades e Migrações

- [x] 1.1 Criar entidade ModelPrice em apps/api/src/database/entities/model-price.entity.ts
- [x] 1.2 Criar entidade AgentModelConfig em apps/api/src/database/entities/agent-model-config.entity.ts
- [x] 1.3 Criar migração para tabelas ModelPrice e AgentModelConfig
- [x] 1.4 Registrar entidades no database.module.ts e data-source.ts
- [x] 1.5 Criar seed com modelos iniciais (gemini-1.5-pro, gemini-2.5-flash-lite)
- [x] 1.6 Criar seed com configurações padrão de agentes

## 2. Backend - Services e Controllers

- [x] 2.1 Criar ModelPriceService com CRUD completo
- [x] 2.2 Criar ModelPriceController com endpoints admin
- [x] 2.3 Criar AgentModelConfigService com CRUD completo
- [x] 2.4 Criar AgentModelConfigController com endpoints admin
- [x] 2.5 Adicionar módulos ao app.module.ts

## 3. Backend - Integração com Agentes

- [x] 3.1 Modificar AgentsService para incluir campo 'model' nos payloads
- [x] 3.2 Modificar queue processors para buscar configuração e injetar modelo
- [x] 3.3 Modificar SafetyService para incluir modelo na requisição

## 4. Backend - Token Usage

- [x] 4.1 Modificar TokenUsageService.getSummary() para incluir byModel
- [x] 4.2 Criar endpoint público GET /config/agent-model/:agentType (opcional)

## 5. Agentes - FastAPI

- [x] 5.1 Modificar DTOs para aceitar campo 'model' em todas as requisições
- [x] 5.2 Modificar content_gen/agent.py para usar req.model
- [x] 5.3 Modificar path_generator/agent.py para usar req.model
- [x] 5.4 Modificar task_analyzer/agent.py para usar req.model
- [x] 5.5 Modificar project_analyzer/agent.py para usar req.model
- [x] 5.6 Modificar safety/agent.py para usar req.model
- [x] 5.7 Adicionar fallback para settings.gemini_model se model não fornecido

## 6. Frontend - Páginas Admin

- [x] 6.1 Criar página ModelPricesPage com CRUD completo
- [x] 6.2 Criar página AgentModelConfigsPage com CRUD completo
- [x] 6.3 Adicionar rotas no router para novas páginas
- [x] 6.4 Adicionar itens no menu admin

## 7. Frontend - Token Usage Page

- [x] 7.1 Criar componente ModelUsageCard (similar a AgentUsageCard)
- [x] 7.2 Modificar TokenUsagePage para exibir seção "Usage by Model"
- [x] 7.3 Atualizar API para buscar dados de resumo com byModel

## 8. Limpeza e Validação

- [x] 8.1 Remover variáveis de ambiente obsoletas (GEMINI_MODEL, GEMINI_MODEL_SAFETY, etc)
- [x] 8.2 Atualizar documentação AGENTS.md e CLAUDE.md
- [x] 8.3 Testar fluxo completo: admin cadastra modelo → configura agente → executa → visualiza custo