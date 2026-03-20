# Edit Subject Specification

## Purpose
Permitir que o usuário edite os dados de um subject (título, nível de habilidade, objetivos) antes de regenerar o study path.

## Scope
O que está **incluído** nessa spec:
- Atualização de título do subject
- Atualização do nível de habilidade (BEGINNER/INTERMEDIATE/ADVANCED)
- Atualização dos objetivos (goals)
- Validação de segurança dos dados editados

O que está **fora do escopo**:
- Criação de subject (já coberto em subjects spec)
- Exclusão de subject (já coberto em subjects spec)
- Geração do study path (já coberto em study-paths spec)

## ADDED Requirements

### Requirement: Update Subject
The system MUST allow an authenticated user to update their own subject with new title, skill level, and goals.

#### Scenario: Atualização com sucesso
- **GIVEN** um usuário autenticado
- **AND** um subject que pertence a esse usuário
- **WHEN** o usuário envia dados válidos para atualização (título, nível, objetivos)
- **THEN** o sistema atualiza os dados do subject
- **AND** retorna os dados atualizados

#### Scenario: Atualização com título vazio
- **GIVEN** um usuário autenticado
- **AND** um subject que pertence a esse usuário
- **WHEN** o usuário envia um título vazio
- **THEN** o sistema rejeita a requisição
- **AND** retorna erro de validação

#### Scenario: Atualização com nível inválido
- **GIVEN** um usuário autenticado
- **AND** um subject que pertence a esse usuário
- **WHEN** o usuário envia um skill level inválido (ex: EXPERT)
- **THEN** o sistema rejeita a requisição
- **AND** retorna erro de validação

#### Scenario: Tentativa de atualizar subject de outro usuário
- **GIVEN** um usuário autenticado
- **AND** um subject que pertence a outro usuário
- **WHEN** o usuário tenta atualizar esse subject
- **THEN** o sistema retorna erro de não encontrado
- **AND** o subject não é atualizado

### Requirement: Validate Goals in Safety Check
The system MUST validate both title AND goals in the safety check before generating a study path.

#### Scenario: Goals passam na validação de segurança
- **GIVEN** um usuário autenticado
- **AND** um subject com goals válidos
- **WHEN** o usuário solicita regenerar o path
- **THEN** o sistema valida título e goals no safety check
- **AND** se ambos forem seguros, prossegue com a geração

#### Scenario: Goals falham na validação de segurança
- **GIVEN** um usuário autenticado
- **AND** um subject com goals contendo conteúdo impróprio
- **WHEN** o usuário solicita regenerar o path
- **AND** o safety check detecta conteúdo impróprio nos goals
- **THEN** o sistema rejeita a requisição
- **AND** retorna erro de segurança com a razão