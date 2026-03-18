# Tasks Specification

## Purpose
Avaliação e análise automatizada (via IA) das tarefas e desafios submetidos pelos alunos.

## Scope
O que está **incluído** nessa spec:
- Visualização dos detalhes da tarefa
- Submissão de respostas (texto, código, markdown) para uma tarefa
- Consulta do status de processamento da submissão
- Recuperação do resultado da análise (feedback e nota)

O que está **fora do escopo**:
- Geração da tarefa em si (parte do conteúdo da fase)

## Requirements

### Requirement: Get Task Details
The system MUST return the instructions and details of a specific task.

#### Scenario: Acesso à tarefa
- GIVEN um usuário autenticado
- WHEN o usuário solicita os detalhes de uma tarefa
- THEN o sistema retorna o conteúdo da tarefa

### Requirement: Submit Task
The system MUST accept a user's submission for a task in various formats (text, code, markdown).

#### Scenario: Submissão válida
- GIVEN uma tarefa pendente
- WHEN o usuário submete seu conteúdo e o tipo de conteúdo (TEXT, CODE, MARKDOWN)
- THEN o sistema registra a submissão e inicia o processo de análise
- AND retorna o ID da submissão

### Requirement: Get Submission Status
The system MUST provide the processing status of a task submission.

#### Scenario: Consulta de processamento
- GIVEN uma submissão em análise
- WHEN o usuário consulta o status da submissão
- THEN o sistema retorna o status atual (ex: PROCESSING, COMPLETED)

### Requirement: Get Analysis Result
The system MUST return the detailed AI feedback and score for a completed submission.

#### Scenario: Análise concluída
- GIVEN uma submissão que já foi processada pela IA
- WHEN o usuário solicita a análise
- THEN o sistema retorna a pontuação (score) e o feedback detalhado
