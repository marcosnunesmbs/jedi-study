# edit-subject Specification

## Purpose
TBD - created by archiving change edit-subject-before-regenerate-path. Update Purpose after archive.
## Requirements
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

