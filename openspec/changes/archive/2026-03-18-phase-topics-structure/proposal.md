## Why

Atualmente, uma fase de estudo é um bloco único de conteúdo e tarefas. Introduzir "Tópicos" dentro das fases permite uma organização mais granular do aprendizado, facilitando o consumo de conteúdo específico e permitindo que a IA gere explicações e exemplos mais focados para cada sub-conceito de uma fase.

## What Changes

- **Prisma Schema**: Adição do campo `topics` (JSON-encoded string[]) ao modelo `Phase` e do campo `topic` (String?) ao modelo `Content`.
- **Agents**: Atualização do schema de saída do `path_generator` para incluir uma lista de tópicos por fase. O prompt do `content_gen` será adaptado para gerar conteúdo baseado em um tópico específico de uma fase.
- **API**: 
    - Modificação do `ContentService` para suportar a geração de conteúdo vinculada a um tópico.
    - Atualização dos serviços de fases para retornar e gerenciar os novos campos.
- **Frontend**: Reformulação da `PhasePage` para agrupar conteúdos por tópicos, possivelmente usando uma estrutura de acordeão ou seções claras, permitindo ao usuário solicitar conteúdo para tópicos específicos.

## Capabilities

### New Capabilities
- Nenhuma.

### Modified Capabilities
- `phases`: Inclusão de tópicos como sub-unidades de uma fase para organização de conteúdo.
- `study-paths`: Atualização do processo de geração de trilhas para incluir a definição de tópicos em cada fase.

## Impact

- **Database**: Migração do Prisma para adicionar novos campos em `Phase` e `Content`.
- **Backend (Python)**: Schemas do Pydantic em `apps/agents` e prompts do sistema.
- **Backend (NestJS)**: Lógica de negócio em `ContentService` e `PhasesService`.
- **Frontend (React)**: Componentes de UI na `PhasePage.tsx`.
