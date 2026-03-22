# Task Generation Specification

## Purpose
Geração sob demanda de desafios (tasks) personalizados para cada fase de estudo, usando IA com contexto do conteúdo estudado.

## Scope
O que está **incluído** nessa spec:
- Geração de tasks sob demanda pelo aluno
- Validação de pré-requisitos (cobertura de tópicos)
- Estrutura de output das tasks geradas
- Processamento assíncrono via fila de jobs
- Tipos de task suportados

O que está **fora do escopo**:
- Avaliação de submissões (coberto em tasks)
- Geração da trilha de estudos (coberto em study-paths)

## Requirements

### Requirement: Generate Tasks for Phase
The system MUST allow an authenticated user to request AI-generated tasks for a phase, producing exactly 2 structured tasks with clear prompts, expected response formats, and evaluation criteria.

#### Scenario: Geração bem-sucedida
- **GIVEN** um usuário autenticado e uma fase ACTIVE com todos os tópicos cobertos (≥1 conteúdo COMPLETE por tópico)
- **WHEN** o usuário solicita a geração de tasks para a fase
- **THEN** o sistema enfileira a geração e retorna imediatamente
- **AND** o agente TaskGenerator produz exatamente 2 tasks

#### Scenario: Prerequisito de cobertura de tópicos não atendido
- **GIVEN** uma fase com N tópicos onde pelo menos 1 tópico não possui conteúdo COMPLETE
- **WHEN** o usuário solicita a geração de tasks
- **THEN** o sistema MUST rejeitar a solicitação com erro informando quais tópicos faltam cobertura

#### Scenario: Fase já possui tasks
- **GIVEN** uma fase que já possui tasks geradas
- **WHEN** o usuário solicita geração de tasks novamente
- **THEN** o sistema MUST rejeitar a solicitação informando que tasks já foram geradas (one-shot)

#### Scenario: Fase LOCKED
- **GIVEN** uma fase com status LOCKED
- **WHEN** o usuário solicita geração de tasks
- **THEN** o sistema MUST rejeitar a solicitação

### Requirement: Task Generation Input Context
The system MUST pass phase metadata and generated content to the TaskGenerator agent as context for creating relevant tasks.

#### Scenario: Contexto completo enviado ao agente
- **WHEN** o sistema envia requisição ao TaskGenerator
- **THEN** MUST incluir: phase title, description, topics, objectives, skillLevel, e o body de todos os conteúdos COMPLETE da fase

### Requirement: Task Generation Output Structure
The system MUST validate that the TaskGenerator agent returns tasks with structured fields.

#### Scenario: Validação do output
- **WHEN** o TaskGenerator retorna as tasks geradas
- **THEN** cada task MUST conter: order, title, type (CONCEPTUAL|CODE_CHALLENGE|ANALYTICAL|MULTI_QUESTION), prompt, expectedResponseFormat, evaluationCriteria (array de strings)
- **AND** hints é opcional (array de strings ou null)

### Requirement: Task Generation Async Processing
The system MUST process task generation asynchronously via job queue, following the same pattern of content generation.

#### Scenario: Processamento assíncrono
- **GIVEN** uma solicitação de geração de tasks aceita
- **WHEN** o job é processado
- **THEN** o sistema chama o agente TaskGenerator, valida o output, e persiste as tasks na fase em transação
- **AND** registra TokenUsage com modelo, tokens e custo

#### Scenario: Falha na geração
- **GIVEN** um job de geração de tasks em processamento
- **WHEN** o agente falha após esgotar retries
- **THEN** o sistema registra o erro no AgentJob
- **AND** permite que o usuário tente novamente

### Requirement: Task Types
The system MUST support exactly 4 task types, all requiring text-based responses.

#### Scenario: Tipos de task válidos
- **WHEN** o TaskGenerator cria tasks
- **THEN** cada task MUST ter type em: CONCEPTUAL, CODE_CHALLENGE, ANALYTICAL, ou MULTI_QUESTION
- **AND** todos os tipos MUST esperar resposta em texto que pode ser avaliada pelo TaskAnalyzer
