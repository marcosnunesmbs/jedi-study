# Phases Specification

## Purpose
Gerenciamento e execução das fases individuais de uma trilha de estudos, além do conteúdo educacional gerado.

## Scope
O que está **incluído** nessa spec:
- Recuperação dos detalhes de uma fase específica (instruções, conteúdo, tarefas)

O que está **fora do escopo**:
- Submissão de tarefas (coberto em tasks)
- Geração da trilha completa (coberto em study-paths)

## Requirements

### Requirement: Get Phase Details
The system MUST return the detailed content (organized by topics) and associated tasks for a specific study phase.

#### Scenario: Acesso com tópicos
- **GIVEN** um usuário autenticado e uma fase com tópicos definidos
- **WHEN** o usuário solicita os detalhes da fase
- **THEN** o sistema retorna os metadados da fase, incluindo a lista de tópicos
- **AND** retorna o conteúdo educacional associado a cada tópico e à fase em geral

#### Scenario: Geração de conteúdo por tópico
- **GIVEN** um usuário autenticado visualizando uma fase
- **WHEN** o usuário solicita a geração de um conteúdo (Explicação, Exemplo, etc.) para um tópico específico
- **THEN** o sistema enfileira a geração focada naquele tópico
- **AND** associa o conteúdo gerado ao tópico correspondente na fase

#### Scenario: Acesso negado
- GIVEN um usuário autenticado
- WHEN o usuário solicita os detalhes de uma fase de outro usuário
- THEN o sistema retorna erro de não autorizado ou não encontrado

### Requirement: Sequential Phase Unlock
The system MUST enforce sequential progression — only one phase is accessible at a time, and the next phase unlocks only after the current one is completed.

#### Scenario: Somente a primeira fase nasce desbloqueada
- GIVEN uma trilha de estudos recém-gerada com N fases
- THEN a fase de ordem 1 tem status ACTIVE
- AND todas as fases de ordem 2 a N têm status LOCKED

#### Scenario: Unlock automático ao concluir fase
- GIVEN uma fase com status ACTIVE cujas tarefas foram todas aprovadas
- WHEN o sistema marca a fase como COMPLETED
- THEN a fase de ordem imediatamente seguinte transita de LOCKED para ACTIVE
- AND o aluno pode acessar as tarefas da nova fase

#### Scenario: Conclusão da última fase encerra a trilha
- GIVEN a fase de maior ordem de uma trilha ativa
- WHEN todas as suas tarefas são aprovadas
- THEN o sistema marca a fase como COMPLETED
- AND atualiza o status da trilha para ARCHIVED (ciclo de aprendizado concluído)

### Requirement: Phase Completion
The system MUST mark a phase as COMPLETED when all of its tasks have a PASSED status.

#### Scenario: Todas as tarefas aprovadas
- **GIVEN** uma fase ACTIVE com todas as tarefas com status PASSED
- **WHEN** o sistema processa a última aprovação
- **THEN** a fase transita para status COMPLETED automaticamente
- **AND** nenhuma ação manual do usuário é necessária

#### Scenario: Fase sem tasks ainda
- **GIVEN** uma fase ACTIVE que ainda não teve tasks geradas
- **WHEN** o sistema verifica o status da fase
- **THEN** a fase MUST permanecer ACTIVE (não pode completar sem tasks)

### Requirement: Topic Coverage Tracking
The system MUST track which topics in a phase have at least one COMPLETE content, enabling the user to see their study progress before generating tasks.

#### Scenario: Verificar cobertura de tópicos
- **GIVEN** uma fase com N tópicos definidos
- **WHEN** o usuário visualiza a fase
- **THEN** o sistema MUST indicar quais tópicos possuem ≥1 conteúdo COMPLETE e quais ainda não foram cobertos

### Requirement: Generate Tasks Button
The system MUST display a "Generate My Challenges" button on the phase page that is enabled only when all topics are covered.

#### Scenario: Botão desabilitado — tópicos não cobertos
- **GIVEN** uma fase onde pelo menos 1 tópico não possui conteúdo COMPLETE
- **WHEN** o usuário visualiza a seção de tasks
- **THEN** o sistema MUST exibir quais tópicos faltam e o botão de geração MUST estar desabilitado

#### Scenario: Botão habilitado — todos os tópicos cobertos
- **GIVEN** uma fase onde todos os tópicos possuem ≥1 conteúdo COMPLETE
- **WHEN** o usuário visualiza a seção de tasks
- **THEN** o botão "Generate My Challenges" MUST estar habilitado

#### Scenario: Botão oculto — tasks já geradas
- **GIVEN** uma fase que já possui tasks geradas
- **WHEN** o usuário visualiza a seção de tasks
- **THEN** o botão de geração MUST NOT ser exibido e as tasks MUST ser listadas normalmente

### Requirement: Task Generation Status Display
The system MUST show real-time generation status while tasks are being created, using polling.

#### Scenario: Geração em andamento
- **GIVEN** o usuário clicou em "Generate My Challenges" e a geração foi aceita
- **WHEN** a geração está em andamento
- **THEN** o sistema MUST exibir um indicador de loading com mensagem
- **AND** MUST fazer polling a cada 3 segundos até as tasks aparecerem

### Requirement: Phase Data Freshness on Navigation
The system MUST refetch phase list data when the user navigates to the Subject page, ensuring phase statuses are always current.

#### Scenario: Voltar para SubjectPage após completar fase
- **WHEN** o usuário completa uma fase e navega de volta para a SubjectPage
- **THEN** o sistema MUST exibir o status atualizado de todas as fases sem necessidade de refresh manual

#### Scenario: Voltar para SubjectPage sem mudanças
- **WHEN** o usuário navega para a SubjectPage sem ter feito alterações
- **THEN** o sistema MUST ainda refetch os dados para garantir freshness
