## 1. Database Migration

- [x] 1.1 Criar migration: adicionar campos `prompt` (TEXT), `expectedResponseFormat` (VARCHAR 255), `evaluationCriteria` (TEXT, JSON), `hints` (TEXT, JSON, nullable) na tabela Task
- [x] 1.2 Na mesma migration: remover coluna `projectContext` da tabela Task
- [x] 1.3 Na mesma migration: atualizar valores de `type` existentes (READING→CONCEPTUAL, EXERCISE→CONCEPTUAL, PROJECT→CONCEPTUAL, QUIZ→CONCEPTUAL) e alterar default para CONCEPTUAL
- [x] 1.4 Atualizar entidade Task (`task.entity.ts`): adicionar novos campos, remover `projectContext`, atualizar type default

## 2. Schemas Compartilhados

- [x] 2.1 Atualizar `StudyPathOutputSchema` em `packages/shared`: remover `tasks` do schema de fase
- [x] 2.2 Criar `TaskGenerationOutputSchema` em `packages/shared`: schema Zod com `tasks[]` contendo order, title, type, prompt, expectedResponseFormat, evaluationCriteria, hints
- [x] 2.3 Atualizar `TaskAnalysisOutputSchema` se necessário para suportar novos campos de avaliação

## 3. PathGenerator — Simplificar

- [x] 3.1 Atualizar `output_schema.py` do PathGenerator: remover `PathTask`, `ProjectContext`, e `tasks` de `PathPhase`
- [x] 3.2 Atualizar `prompts.py` do PathGenerator: remover referências a tasks, tipos de task, e projectContext do system prompt e build_prompt
- [x] 3.3 Atualizar `path-generation.processor.ts`: remover criação de Tasks durante hidratação de fases

## 4. TaskGenerator — Novo Agente

- [x] 4.1 Criar diretório `apps/agents/agents/task_generator/` com `__init__.py`
- [x] 4.2 Criar `output_schema.py` com schema Pydantic: `GeneratedTask` e `TaskGenerationOutput` (2 tasks, tipos CONCEPTUAL|CODE_CHALLENGE|ANALYTICAL|MULTI_QUESTION)
- [x] 4.3 Criar `prompts.py` com system prompt especializado em criação de exercícios avaliativos textuais e `build_prompt()` que recebe phase info + conteúdos
- [x] 4.4 Criar `agent.py` com função `generate_tasks()` que chama Gemini e valida output
- [x] 4.5 Criar router FastAPI `apps/agents/routers/task_generator.py` com endpoint POST
- [x] 4.6 Registrar router no `main.py` do agents

## 5. ProjectAnalyzer — Remover

- [x] 5.1 Remover diretório `apps/agents/agents/project_analyzer/`
- [x] 5.2 Remover router `apps/agents/routers/project_analyzer.py`
- [x] 5.3 Remover registro do router no `main.py` do agents

## 6. TaskAnalyzer — Atualizar

- [x] 6.1 Atualizar `prompts.py` do TaskAnalyzer: modificar `build_prompt()` para receber e incluir `prompt`, `expectedResponseFormat`, `evaluationCriteria` no prompt de avaliação
- [x] 6.2 Atualizar `task-analysis.processor.ts`: passar novos campos da task ao agente e remover roteamento para ProjectAnalyzer

## 7. API — Endpoint e Fila de Geração de Tasks

- [x] 7.1 Criar fila BullMQ `task-generation` em `src/queues/` com processor
- [x] 7.2 Criar método `generateTasks(phaseId, userId)` no `PhasesService` que valida prerequisitos (fase ACTIVE, todos tópicos cobertos, sem tasks existentes) e enfileira job
- [x] 7.3 Criar endpoint `POST /phases/:id/generate-tasks` no `PhasesController`
- [x] 7.4 Implementar `task-generation.processor.ts`: buscar fase + conteúdos, chamar agente, validar com Zod, persistir tasks em transação, registrar TokenUsage
- [x] 7.5 Atualizar `agents.service.ts`: adicionar método para chamar TaskGenerator
- [x] 7.6 Registrar fila e processor no módulo (queues module + bull config)

## 8. AgentModelConfig — Novo Tipo

- [x] 8.1 Atualizar enum `AgentType` na entidade `AgentModelConfig`: adicionar `TASK_GENERATOR`, remover `PROJECT_ANALYZER`
- [x] 8.2 Atualizar frontend admin de configuração de modelos (se existir lista de tipos)

## 9. Frontend — PhasePage Redesign

- [x] 9.1 Criar API client `tasksApi.generateForPhase(phaseId)` em `apps/web/src/api/phases.api.ts`
- [x] 9.2 Atualizar PhasePage: calcular cobertura de tópicos (quais têm conteúdo COMPLETE) e exibir indicadores visuais
- [x] 9.3 Atualizar PhasePage: adicionar botão "Generate My Challenges" habilitado apenas quando todos os tópicos estão cobertos
- [x] 9.4 Atualizar PhasePage: adicionar mutation para chamar endpoint de geração + estado de loading/polling enquanto tasks são geradas
- [x] 9.5 Atualizar PhasePage: exibir tasks geradas com badges de tipo (CONCEPTUAL, CODE_CHALLENGE, ANALYTICAL, MULTI_QUESTION)

## 10. Frontend — TaskPage Ajustes

- [x] 10.1 Atualizar TaskPage: exibir `prompt` como conteúdo principal da task (em vez de `description` genérico)
- [x] 10.2 Atualizar TaskPage: exibir `expectedResponseFormat` como dica para o aluno
- [x] 10.3 Atualizar TaskPage: exibir `hints` se disponível (toggle expandível)
