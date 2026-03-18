## MODIFIED Requirements

### Requirement: Generate Study Path
The system MUST allow a user to trigger the generation of a study path for one of their subjects, and the resulting path MUST include structured topics within each phase.

#### Scenario: Geração com tópicos
- **GIVEN** um usuário autenticado e um assunto válido
- **WHEN** o usuário solicita a geração da trilha
- **THEN** o sistema gera uma trilha onde cada fase contém uma lista de tópicos lógicos relacionados aos seus objetivos

### Requirement: Get Active Study Path
The system MUST return the active study path (including its phases and topics) for a given subject.

#### Scenario: Trilha com tópicos
- **GIVEN** um assunto com uma trilha gerada com tópicos
- **WHEN** o usuário solicita a trilha ativa
- **THEN** o sistema retorna a trilha e as fases contendo suas respectivas listas de tópicos
