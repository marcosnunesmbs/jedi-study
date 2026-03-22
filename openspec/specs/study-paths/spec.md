# Study Paths Specification

## Purpose
Geração e acompanhamento de trilhas de estudo (study paths) baseadas em Inteligência Artificial para os assuntos dos usuários.

## Scope
O que está **incluído** nessa spec:
- Solicitação de geração de uma nova trilha de estudos
- Consulta do status de geração da trilha (processamento assíncrono)
- Recuperação da trilha de estudos ativa de um assunto
- Visualização dos detalhes da trilha de estudos

O que está **fora do escopo**:
- Execução das fases da trilha (coberto em phases)

## Requirements

### Requirement: Generate Study Path
The system MUST allow a user to trigger the generation of a study path for one of their subjects, and the resulting path MUST include structured topics within each phase but MUST NOT include tasks.

#### Scenario: Geração com tópicos sem tasks
- **GIVEN** um usuário autenticado e um assunto válido
- **WHEN** o usuário solicita a geração da trilha
- **THEN** o sistema gera uma trilha onde cada fase contém topics, objectives, description, e estimatedHours
- **AND** as fases NÃO contêm tasks (tasks são geradas sob demanda pelo aluno)

#### Scenario: Geração é assíncrona
- GIVEN um usuário autenticado e um assunto válido
- WHEN o usuário solicita a geração da trilha
- THEN o sistema registra a trilha com status GENERATING e retorna imediatamente o `studyPathId`
- AND a geração ocorre em background via fila de jobs

#### Scenario: Versionamento ao regerar
- GIVEN um assunto que já possui uma trilha ativa
- WHEN o usuário solicita a geração de uma nova trilha
- THEN o sistema arquiva a trilha anterior (status ARCHIVED, isActive=false)
- AND cria uma nova trilha com versão incrementada como a ativa (isActive=true)

#### Scenario: Falha na geração
- GIVEN um processo de geração em andamento
- WHEN o Agents Service retorna erro após esgotar as tentativas de retry
- THEN o sistema atualiza a trilha para status ARCHIVED
- AND registra o erro no AgentJob correspondente

### Requirement: Get Generation Status
The system MUST provide the current status of the study path generation process.

#### Scenario: Consulta de status
- GIVEN um processo de geração de trilha em andamento
- WHEN o usuário consulta o status da trilha
- THEN o sistema retorna o estado atual (ex: PENDING, PROCESSING, COMPLETED, FAILED)

### Requirement: Get Active Study Path
The system MUST return the active study path (including its phases and topics) for a given subject.

#### Scenario: Trilha com tópicos
- **GIVEN** um assunto com uma trilha gerada com tópicos
- **WHEN** o usuário solicita a trilha ativa
- **THEN** o sistema retorna a trilha e as fases contendo suas respectivas listas de tópicos

#### Scenario: Trilha inexistente
- GIVEN um assunto sem trilha ativa
- WHEN o usuário solicita a trilha ativa
- THEN o sistema retorna uma resposta vazia ou não encontrada

### Requirement: Get Study Path Details
The system MUST return the details of a specific study path by its ID.

#### Scenario: Acesso aos detalhes
- GIVEN um usuário autenticado
- WHEN o usuário solicita uma trilha pelo ID que lhe pertence
- THEN o sistema retorna a estrutura completa da trilha

#### Scenario: Acesso negado a trilha de outro usuário
- GIVEN um usuário autenticado
- WHEN o usuário solicita uma trilha que pertence a outro usuário
- THEN o sistema retorna erro de não autorizado ou não encontrado

### Requirement: Study Path Status Lifecycle
The system MUST transition a study path through a defined set of statuses reflecting the generation and learning progress.

#### Scenario: Ciclo completo de geração
- **GIVEN** uma nova trilha criada
- **THEN** seu status inicial é GENERATING
- **AND** após geração bem-sucedida das fases (sem tasks), transita para ACTIVE
- **AND** ao término de todas as fases pelo aluno, transita para ARCHIVED

#### Scenario: Apenas uma trilha ativa por assunto
- GIVEN um assunto que já possui uma trilha com isActive=true
- WHEN uma nova geração é concluída com sucesso
- THEN somente a nova trilha possui isActive=true
- AND todas as versões anteriores têm isActive=false
