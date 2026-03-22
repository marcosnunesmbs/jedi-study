## Context

O PathGenerator atualmente gera a trilha completa incluindo tasks em uma única chamada. As tasks resultantes são vagas (ex: "Leia o livro X", "Instale a ferramenta Y") e frequentemente pedem ações não verificáveis por texto. O TaskAnalyzer recebe apenas `task_title` e `task_description` como contexto, sem critérios de avaliação estruturados.

O app tem 5 agentes Python (PathGenerator, ContentGen, TaskAnalyzer, ProjectAnalyzer, Safety), cada um como um router FastAPI. Tasks são persistidas com campos genéricos (title, description, type, projectContext). O modelo de configuração de agentes (AgentModelConfig) usa um enum `AgentType` para selecionar qual modelo cada agente usa.

## Goals / Non-Goals

**Goals:**
- Tasks sempre avaliáveis por resposta textual (perguntas, código, análise)
- Separar responsabilidades: PathGenerator foca em estrutura, TaskGenerator foca em avaliação
- Tasks contextualizadas: geradas APÓS o aluno estudar, usando os conteúdos como contexto
- TaskAnalyzer com critérios estruturados para avaliação mais precisa

**Non-Goals:**
- Múltiplas rodadas de geração de tasks (é one-shot por fase)
- Geração automática de tasks (requer ação do aluno)
- Migração de tasks existentes para novos tipos (breaking change aceito)
- Manter o agente ProjectAnalyzer

## Decisions

### 1. Novo agente TaskGenerator (Python)

Criar `apps/agents/agents/task_generator/` com prompt especializado em criação de exercícios avaliativos. O agente recebe: phase title/description, topics, objectives, skillLevel, e os conteúdos gerados (body de cada content COMPLETE da fase).

**Output schema (Pydantic):**
```python
class GeneratedTask(BaseModel):
    order: int
    title: str
    type: str  # CONCEPTUAL | CODE_CHALLENGE | ANALYTICAL | MULTI_QUESTION
    prompt: str  # A pergunta/desafio claro e específico
    expectedResponseFormat: str  # Ex: "texto dissertativo 200-500 palavras"
    evaluationCriteria: List[str]  # Critérios objetivos
    hints: Optional[List[str]] = None

class TaskGenerationOutput(BaseModel):
    tasks: List[GeneratedTask]  # Exatamente 2 tasks
```

Gera exatamente 2 tasks por fase. O tipo é escolhido pelo agente com base no conteúdo estudado (nem todo tema envolve código, então CODE_CHALLENGE não é obrigatório).

**Alternativa descartada:** Gerar N tasks e deixar o aluno escolher — complexidade desnecessária, one-shot é mais direto.

### 2. PathGenerator simplificado

Remover `tasks[]` do output schema do PathGenerator. O agente passa a gerar apenas: phases com topics, objectives, description, estimatedHours. Isso simplifica o prompt e melhora a qualidade da estrutura.

Schema atualizado:
```python
class PathPhase(BaseModel):
    order: int
    title: str
    description: str
    objectives: List[str]
    topics: List[str]
    estimatedHours: int
    # SEM tasks
```

**Impacto no processor:** `path-generation.processor.ts` deixa de criar Tasks durante a hidratação. Fases nascem sem tasks.

### 3. Entidade Task — novos campos e tipos

**Novos campos:**
- `prompt` (TEXT) — a pergunta/desafio em si, separado do `description`
- `expectedResponseFormat` (VARCHAR) — formato esperado da resposta
- `evaluationCriteria` (TEXT, JSON string) — lista de critérios
- `hints` (TEXT, JSON string, nullable) — dicas opcionais

**Campos removidos:**
- `projectContext` (TEXT) — removido junto com tipo PROJECT

**Tipos atualizados:**
- `type` default muda de `EXERCISE` para `CONCEPTUAL`
- Valores aceitos: `CONCEPTUAL`, `CODE_CHALLENGE`, `ANALYTICAL`, `MULTI_QUESTION`

**Migration:** Criar migration que: adiciona novos campos, remove `projectContext`, atualiza enum de types. Tasks existentes com tipos antigos receberão type `CONCEPTUAL` como fallback.

### 4. Prerequisito de cobertura de tópicos

O endpoint `POST /phases/:id/generate-tasks` valida no backend que cada tópico da fase tem ≥1 conteúdo com status COMPLETE antes de enfileirar a geração. Isso garante que o aluno estudou antes de ser avaliado.

**Verificação:** Parseia `phase.topics` (JSON string), cruza com `phase.contents` filtrando por `status === 'COMPLETE'` e `topic IS NOT NULL`, verifica se todos os tópicos estão cobertos.

**Alternativa descartada:** Validar apenas no frontend — insuficiente, o backend deve garantir a regra de negócio.

### 5. Nova fila BullMQ: `task-generation`

Criar fila `task-generation` com processor que:
1. Busca a fase com todos os conteúdos COMPLETE
2. Monta o input (phase info + conteúdos)
3. Chama o TaskGenerator agent
4. Valida resposta com Zod
5. Persiste tasks na fase em transação TypeORM
6. Registra TokenUsage

Segue o mesmo padrão das filas existentes (3 attempts, exponential backoff).

### 6. TaskAnalyzer atualizado

O prompt do TaskAnalyzer passa a receber os campos estruturados:
```
Task: {title}
Type: {type}
Prompt: {prompt}
Expected response format: {expectedResponseFormat}
Evaluation criteria:
- {criterion 1}
- {criterion 2}

Student submission:
---
{submission}
---
```

Isso dá ao avaliador critérios claros para pontuar, em vez de depender apenas do `description` genérico.

### 7. PhasePage — estados de geração de tasks

A seção "Tasks & Exercises" na PhasePage passa a ter 4 estados:

1. **Tópicos não cobertos** — Mostra quais tópicos faltam conteúdo, botão desabilitado
2. **Pronto para gerar** — Todos os tópicos cobertos, botão "Gerar Meus Desafios" habilitado
3. **Gerando** — Polling com spinner (igual conteúdos)
4. **Tasks geradas** — Lista de tasks (layout atual adaptado para novos tipos)

O polling usa o mesmo padrão dos conteúdos: `refetchInterval` condicional de 3s enquanto a fase não tiver tasks ou tiver tasks com status de geração pendente.

### 8. Remoção do ProjectAnalyzer

O agente `project_analyzer` e seu router são removidos. O `task-analysis.processor.ts` deixa de verificar o tipo PROJECT e rotear para o ProjectAnalyzer. Todas as tasks passam pelo TaskAnalyzer padrão.

### 9. AgentModelConfig — novo tipo TASK_GENERATOR

Adicionar `TASK_GENERATOR` ao enum `AgentType` na entidade `AgentModelConfig` e no frontend de configuração de modelos do admin.

## Risks / Trade-offs

- **[Breaking change em tasks existentes]** → Mitigação: migration faz fallback de tipos antigos para CONCEPTUAL. Tasks existentes perdem projectContext mas ganham campos novos como null.
- **[Custo extra de tokens]** → O TaskGenerator recebe os conteúdos da fase como contexto, aumentando input tokens. Trade-off aceito: qualidade das tasks é prioridade.
- **[One-shot sem regeneração]** → Se as tasks geradas forem ruins, o aluno não pode pedir novas. Mitigação: prompt do agente será bem refinado. Pode ser adicionado futuramente se necessário.
- **[Fase sem tasks até aluno agir]** → Fases nascem vazias de tasks. Isso é intencional: o aluno precisa estudar antes de ser avaliado.

## Migration Plan

1. Criar migration: adicionar campos `prompt`, `expectedResponseFormat`, `evaluationCriteria`, `hints` na tabela Task; remover `projectContext`; atualizar type default
2. Deploy do agente Python (TaskGenerator novo, PathGenerator atualizado, ProjectAnalyzer removido)
3. Deploy da API (novo endpoint, nova fila, processors atualizados)
4. Deploy do frontend (PhasePage atualizada)
5. Study paths já gerados continuam funcionando (tasks existentes mantêm compatibilidade via migration)
