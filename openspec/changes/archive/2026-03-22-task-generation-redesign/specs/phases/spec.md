## ADDED Requirements

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

## MODIFIED Requirements

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
