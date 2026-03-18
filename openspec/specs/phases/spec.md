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
The system MUST return the detailed content and associated tasks for a specific study phase.

#### Scenario: Acesso permitido
- GIVEN um usuário autenticado
- WHEN o usuário solicita os detalhes de uma fase que pertence à sua trilha de estudos
- THEN o sistema retorna o conteúdo estruturado da fase (texto explicativo, exemplos, tarefas)

#### Scenario: Acesso negado
- GIVEN um usuário autenticado
- WHEN o usuário solicita os detalhes de uma fase de outro usuário
- THEN o sistema retorna erro de não autorizado ou não encontrado
