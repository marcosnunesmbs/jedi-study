## MODIFIED Requirements

### Requirement: Get Task Details
The system MUST return the instructions and details of a specific task, including structured prompt, expected response format, evaluation criteria, and optional hints.

#### Scenario: Acesso à tarefa
- **GIVEN** um usuário autenticado
- **WHEN** o usuário solicita os detalhes de uma tarefa
- **THEN** o sistema retorna o conteúdo da tarefa incluindo: title, type, prompt, expectedResponseFormat, evaluationCriteria, hints

### Requirement: Submit Task
The system MUST accept a user's submission for a task in text format (text, code, or markdown).

#### Scenario: Submissão válida
- **GIVEN** uma tarefa pendente
- **WHEN** o usuário submete seu conteúdo e o tipo de conteúdo (TEXT, CODE, MARKDOWN)
- **THEN** o sistema registra a submissão e inicia o processo de análise
- **AND** retorna o ID da submissão

#### Scenario: Múltiplas tentativas
- **GIVEN** uma tarefa em que o aluno já submeteu anteriormente
- **WHEN** o usuário submete novamente
- **THEN** o sistema registra uma nova submissão com `attempt` incrementado
- **AND** a análise da nova submissão é independente das anteriores

#### Scenario: Análise usa critérios estruturados
- **GIVEN** uma tarefa com evaluationCriteria definidos
- **WHEN** o usuário submete a tarefa
- **THEN** o sistema encaminha a análise ao TaskAnalyzer incluindo: prompt, expectedResponseFormat e evaluationCriteria da task
- **AND** o TaskAnalyzer avalia a submissão contra cada critério

## REMOVED Requirements

### Requirement: Análise de tarefa do tipo PROJECT
**Reason:** Tipo PROJECT removido. Todas as tasks são avaliadas pelo TaskAnalyzer padrão com critérios estruturados.
**Migration:** Tasks existentes do tipo PROJECT terão type atualizado para CONCEPTUAL. O campo projectContext será removido da entidade.
