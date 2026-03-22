## Why

Tasks geradas pelo PathGenerator são vagas e frequentemente pedem ações não verificáveis por texto (ler livro, instalar ferramenta). O aluno não sabe o que escrever como resposta. Separar a geração de tasks em um agente especialista, com tipos estruturados e critérios de avaliação claros, garante exercícios que sempre esperam respostas textuais avaliáveis.

## What Changes

- **BREAKING** — Remover geração de tasks do PathGenerator (output schema perde `tasks[]` das fases)
- **BREAKING** — Substituir tipos de task: `READING|EXERCISE|PROJECT|QUIZ` → `CONCEPTUAL|CODE_CHALLENGE|ANALYTICAL|MULTI_QUESTION`
- **BREAKING** — Remover `projectContext` da entidade Task e remover agente ProjectAnalyzer
- Criar novo agente Python **TaskGenerator** que gera exatamente 2 tasks por fase, com tipos, prompt claro, formato de resposta esperado e critérios de avaliação
- Criar endpoint API `POST /phases/:id/generate-tasks` que valida prerequisito (≥1 conteúdo COMPLETE por tópico) e enfileira geração
- Adicionar campos na entidade Task: `prompt`, `expectedResponseFormat`, `evaluationCriteria`, `hints`
- Atualizar TaskAnalyzer para usar `evaluationCriteria` estruturados na avaliação
- Atualizar PhasePage: mostrar estados de tópicos cobertos, botão "Gerar Meus Desafios", polling de geração
- Adicionar `TASK_GENERATOR` ao enum AgentType para configuração de modelo

## Capabilities

### New Capabilities
- `task-generation`: Geração sob demanda de tasks estruturadas por fase via agente especialista, com prerequisito de cobertura de tópicos

### Modified Capabilities
- `tasks`: Novos tipos de task (CONCEPTUAL, CODE_CHALLENGE, ANALYTICAL, MULTI_QUESTION), novos campos (prompt, expectedResponseFormat, evaluationCriteria, hints), remoção de PROJECT e projectContext
- `study-paths`: PathGenerator não gera mais tasks — output schema perde tasks[] das fases
- `phases`: Nova seção na PhasePage com estados de cobertura de tópicos e botão de geração de tasks; geração de tasks é uma ação da fase
- `agent-model-configuration`: Novo agentType TASK_GENERATOR adicionado ao enum

## Impact

- `apps/agents/` — Novo agente TaskGenerator, remoção do ProjectAnalyzer, atualização do PathGenerator (schema sem tasks), atualização do TaskAnalyzer (usar evaluationCriteria)
- `apps/api/` — Nova migration (campos Task, tipos), novo endpoint, nova fila BullMQ `task-generation`, atualização do path-generation processor, atualização do task-analysis processor
- `apps/web/` — PhasePage redesign da seção de tasks, TaskPage ajuste para novos campos
- `packages/shared/` — Atualização do StudyPathOutputSchema (sem tasks), novo TaskGenerationOutputSchema
