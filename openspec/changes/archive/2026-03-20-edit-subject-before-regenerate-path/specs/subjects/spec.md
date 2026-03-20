# Subjects Specification

## Purpose
Gerenciamento dos assuntos (subjects) que o usuário deseja estudar, incluindo seus objetivos e nível de habilidade.

## Scope
O que está **incluído** nessa spec:
- Criação de um novo assunto de estudo
- Listagem dos assuntos do usuário
- Visualização dos detalhes de um assunto
- Exclusão de um assunto
- **Edição de um assunto existente**

O que está **fora do escopo**:
- Geração da trilha de estudos (coberto em study-paths)

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