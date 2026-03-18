# Subjects Specification

## Purpose
Gerenciamento dos assuntos (subjects) que o usuário deseja estudar, incluindo seus objetivos e nível de habilidade.

## Scope
O que está **incluído** nessa spec:
- Criação de um novo assunto de estudo
- Listagem dos assuntos do usuário
- Visualização dos detalhes de um assunto
- Exclusão de um assunto

O que está **fora do escopo**:
- Geração da trilha de estudos (coberto em study-paths)
- Edição dos detalhes do assunto após a criação

## Requirements

### Requirement: Create Subject
The system MUST allow an authenticated user to create a new study subject with a title, description, skill level, and goals.

#### Scenario: Criação com sucesso
- GIVEN um usuário autenticado
- WHEN o usuário envia os dados válidos do assunto (título, nível: BEGINNER/INTERMEDIATE/ADVANCED, objetivos)
- THEN o sistema cria o assunto associado ao usuário
- AND retorna os dados do assunto criado

#### Scenario: Dados inválidos
- GIVEN um usuário autenticado
- WHEN o usuário envia um skill level inválido (ex: EXPERT)
- THEN o sistema rejeita a requisição
- AND retorna um erro de validação

### Requirement: List Subjects
The system MUST return a list of subjects belonging to the authenticated user.

#### Scenario: Usuário possui assuntos
- GIVEN um usuário autenticado com assuntos cadastrados
- WHEN o usuário solicita a listagem de assuntos
- THEN o sistema retorna a lista dos seus assuntos
- AND não retorna assuntos de outros usuários

### Requirement: Get Subject Details
The system MUST return the details of a specific subject if it belongs to the authenticated user.

#### Scenario: Acesso permitido
- GIVEN um usuário autenticado
- WHEN o usuário solicita os detalhes de um assunto que lhe pertence
- THEN o sistema retorna os detalhes do assunto

#### Scenario: Acesso negado
- GIVEN um usuário autenticado
- WHEN o usuário solicita os detalhes de um assunto que pertence a outro usuário
- THEN o sistema retorna um erro de não autorizado ou não encontrado

### Requirement: Delete Subject
The system MUST allow an authenticated user to delete their own subject.

#### Scenario: Exclusão com sucesso
- GIVEN um usuário autenticado
- WHEN o usuário solicita a exclusão de um assunto que lhe pertence
- THEN o sistema exclui o assunto e seus dados relacionados
- AND retorna sucesso

#### Scenario: Tentativa de excluir assunto de outro usuário
- GIVEN um usuário autenticado
- WHEN o usuário tenta excluir um assunto que não lhe pertence
- THEN o sistema retorna um erro
- AND o assunto não é excluído
