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
The system MUST allow a user to trigger the generation of a study path for one of their subjects.

#### Scenario: Geração iniciada
- GIVEN um usuário autenticado e um assunto válido que lhe pertence
- WHEN o usuário solicita a geração da trilha
- THEN o sistema inicia o processo de geração (enfileira a tarefa)
- AND retorna um identificador ou status indicando que o processamento começou

### Requirement: Get Generation Status
The system MUST provide the current status of the study path generation process.

#### Scenario: Consulta de status
- GIVEN um processo de geração de trilha em andamento
- WHEN o usuário consulta o status da trilha
- THEN o sistema retorna o estado atual (ex: PENDING, PROCESSING, COMPLETED, FAILED)

### Requirement: Get Active Study Path
The system MUST return the active study path for a given subject.

#### Scenario: Trilha existente
- GIVEN um assunto com uma trilha de estudos já gerada e ativa
- WHEN o usuário solicita a trilha ativa do assunto
- THEN o sistema retorna a trilha e suas fases associadas

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
