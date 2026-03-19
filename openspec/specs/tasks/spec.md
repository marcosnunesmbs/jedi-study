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

#### Scenario: Múltiplas tentativas
- GIVEN uma tarefa em que o aluno já submeteu anteriormente
- WHEN o usuário submete novamente
- THEN o sistema registra uma nova submissão com `attempt` incrementado
- AND a análise da nova submissão é independente das anteriores

#### Scenario: Análise de tarefa do tipo PROJECT
- GIVEN uma tarefa com tipo PROJECT contendo `projectContext` (deliverables, evaluationCriteria, suggestedTechStack)
- WHEN o usuário submete a tarefa
- THEN o sistema encaminha a análise para o agente especializado em projetos
- AND o resultado inclui `technicalAssessment` e `architectureNotes` além do feedback padrão

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

### Requirement: Pass/Fail Threshold
The system MUST evaluate a submission as PASSED if the score is 70 or above, and FAILED otherwise.

#### Scenario: Submissão aprovada
- GIVEN uma submissão analisada com score >= 70
- THEN o sistema marca a submissão como `passed=true`
- AND a tarefa recebe status PASSED

#### Scenario: Submissão reprovada
- GIVEN uma submissão analisada com score < 70
- THEN o sistema marca a submissão como `passed=false`
- AND a tarefa recebe status FAILED
- AND o aluno SHOULD poder submeter novamente

### Requirement: Phase Unlock Trigger
The system MUST automatically trigger the phase unlock check after every task approval.

#### Scenario: Última tarefa da fase aprovada
- GIVEN uma fase ACTIVE em que todas as demais tarefas já possuem status PASSED
- WHEN a última tarefa tem sua submissão aprovada (score >= 70)
- THEN o sistema automaticamente marca a fase como COMPLETED
- AND desbloqueia a próxima fase (se existir) sem necessidade de ação manual
