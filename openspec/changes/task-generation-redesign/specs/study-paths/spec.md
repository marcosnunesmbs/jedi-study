## MODIFIED Requirements

### Requirement: Generate Study Path
The system MUST allow a user to trigger the generation of a study path for one of their subjects, and the resulting path MUST include structured topics within each phase but MUST NOT include tasks.

#### Scenario: Geração com tópicos sem tasks
- **GIVEN** um usuário autenticado e um assunto válido
- **WHEN** o usuário solicita a geração da trilha
- **THEN** o sistema gera uma trilha onde cada fase contém topics, objectives, description, e estimatedHours
- **AND** as fases NÃO contêm tasks (tasks são geradas sob demanda pelo aluno)

#### Scenario: Geração é assíncrona
- **GIVEN** um usuário autenticado e um assunto válido
- **WHEN** o usuário solicita a geração da trilha
- **THEN** o sistema registra a trilha com status GENERATING e retorna imediatamente o `studyPathId`
- **AND** a geração ocorre em background via fila de jobs

#### Scenario: Versionamento ao regerar
- **GIVEN** um assunto que já possui uma trilha ativa
- **WHEN** o usuário solicita a geração de uma nova trilha
- **THEN** o sistema arquiva a trilha anterior (status ARCHIVED, isActive=false)
- **AND** cria uma nova trilha com versão incrementada como a ativa (isActive=true)

#### Scenario: Falha na geração
- **GIVEN** um processo de geração em andamento
- **WHEN** o Agents Service retorna erro após esgotar as tentativas de retry
- **THEN** o sistema atualiza a trilha para status ARCHIVED
- **AND** registra o erro no AgentJob correspondente

### Requirement: Study Path Status Lifecycle
The system MUST transition a study path through a defined set of statuses reflecting the generation and learning progress.

#### Scenario: Ciclo completo de geração
- **GIVEN** uma nova trilha criada
- **THEN** seu status inicial é GENERATING
- **AND** após geração bem-sucedida das fases (sem tasks), transita para ACTIVE
- **AND** ao término de todas as fases pelo aluno, transita para ARCHIVED
