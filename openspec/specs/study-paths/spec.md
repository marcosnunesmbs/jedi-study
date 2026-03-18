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
The system MUST allow a user to trigger the generation of a study path for one of their subjects, and the resulting path MUST include structured topics within each phase.

#### Scenario: Geração com tópicos
- **GIVEN** um usuário autenticado e um assunto válido
- **WHEN** o usuário solicita a geração da trilha
- **THEN** o sistema gera uma trilha onde cada fase contém uma lista de tópicos lógicos relacionados aos seus objetivos

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
