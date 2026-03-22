## ADDED Requirements

### Requirement: Phase Data Freshness on Navigation
The system MUST refetch phase list data when the user navigates to the Subject page, ensuring phase statuses are always current.

#### Scenario: Voltar para SubjectPage após completar fase
- **WHEN** o usuário completa uma fase e navega de volta para a SubjectPage
- **THEN** o sistema MUST exibir o status atualizado de todas as fases sem necessidade de refresh manual

#### Scenario: Voltar para SubjectPage sem mudanças
- **WHEN** o usuário navega para a SubjectPage sem ter feito alterações
- **THEN** o sistema MUST ainda refetch os dados para garantir freshness
