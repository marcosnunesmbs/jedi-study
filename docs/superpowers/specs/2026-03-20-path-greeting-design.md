# Design Spec: Study Path Greeting (Welcome Message)

**Date:** 2026-03-20
**Status:** Approved
**Topic:** Adicionar uma saudação motivadora e instrutiva para novas trilhas de estudo, explicando como os objetivos do usuário foram considerados.

## Context
Atualmente, as trilhas de estudo são geradas pela IA e exibidas no frontend sem uma introdução contextualizada. O usuário deseja que cada trilha tenha uma saudação ("welcome message") que destaque como o percurso foi construído para atingir seus objetivos específicos.

## Requirements
- O Agente de IA deve gerar uma mensagem de boas-vindas curta (2-3 sentenças), motivadora e instrutiva.
- A mensagem deve residir no objeto raiz da trilha de estudos.
- O campo deve ser persistido no banco de dados.
- O Frontend deve exibir essa mensagem com destaque no início da visualização da trilha.

## Proposed Design

### 1. Agents (AI Logic)
- **File:** `apps/agents/agents/path_generator/output_schema.py`
  - Adicionar o campo `welcomeMessage: str` à classe `StudyPathOutput`.
- **File:** `apps/agents/agents/path_generator/prompts.py`
  - Atualizar o `SYSTEM_PROMPT` para incluir `welcomeMessage` no esquema JSON solicitado no exemplo estrutural.
  - Adicionar instruções no prompt para que a mensagem seja motivadora, instrutiva e focada nos objetivos do usuário.

### 2. API (Backend)
- **File:** `apps/api/src/shared/schemas/study-path.schema.ts`
  - Atualizar o esquema Zod (`StudyPathOutputSchema`) para incluir o campo `welcomeMessage: z.string()`.
- **File:** `apps/api/src/database/entities/study-path.entity.ts`
  - Adicionar a coluna `welcomeMessage: string` (tipo `text`, nullable).
- **File:** `apps/api/src/queues/path-generation.processor.ts`
  - Mapear o campo `welcomeMessage` da resposta do agente para a entidade no momento em que a trilha é criada/salva.
- **Database Migration:**
  - Gerar uma nova migration para adicionar a coluna `welcomeMessage` na tabela `study_paths`.

### 3. Frontend (Web)
- **File:** `apps/web/src/pages/SubjectPage.tsx`
  - Adicionar um componente de destaque (ex: um painel ou Card estilizado) no topo da visualização da trilha ativa para exibir a `welcomeMessage`.

## Trade-offs
- **Geração por IA:** Aumenta ligeiramente o tempo de geração e o custo de tokens, mas fornece uma experiência superior e personalizada comparada a templates estáticos.

## Testing Strategy
- **Unit Tests (Agents):** Verificar se o esquema de saída agora inclui o campo `welcomeMessage` e se ele é preenchido no JSON retornado.
- **Integration Tests (API):** Confirmar se a nova coluna no banco é preenchida corretamente pelo processador de fila e se o frontend recebe essa informação.
- **Visual Testing (Web):** Validar a renderização da mensagem no topo da página de assunto.
