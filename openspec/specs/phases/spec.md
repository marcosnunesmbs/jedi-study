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
- GIVEN uma fase ACTIVE com todas as tarefas com status PASSED
- WHEN o sistema processa a última aprovação
- THEN a fase transita para status COMPLETED automaticamente
- AND nenhuma ação manual do usuário é necessária
