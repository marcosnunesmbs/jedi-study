## MODIFIED Requirements

### Requirement: List Subjects
The system MUST return a list of subjects belonging to the authenticated user. Each subject SHALL include a computed `progress` field (integer, 0–100) representing task completion percentage.

#### Scenario: Usuário possui assuntos
- **GIVEN** um usuário autenticado com assuntos cadastrados
- **WHEN** o usuário solicita a listagem de assuntos
- **THEN** o sistema retorna a lista dos seus assuntos com o campo `progress` calculado para cada um
- **AND** não retorna assuntos de outros usuários
