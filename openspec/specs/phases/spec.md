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
