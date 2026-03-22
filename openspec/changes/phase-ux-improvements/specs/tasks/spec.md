## ADDED Requirements

### Requirement: Cascade Cache Invalidation on Task Completion
The system MUST invalidate parent entity caches when a task submission is approved, ensuring all related pages display current data.

#### Scenario: Task aprovada invalida caches em cascata
- **WHEN** a análise de uma submissão retorna passed=true
- **THEN** o sistema MUST invalidar as queries de: phase, task, study-path-active, e subjects
- **AND** as páginas SubjectPage e DashboardPage MUST exibir dados atualizados na próxima navegação

### Requirement: Dashboard Data Freshness
The system MUST refetch subject data when the user navigates to the Dashboard page.

#### Scenario: Voltar para DashboardPage após progresso
- **WHEN** o usuário navega para a DashboardPage após completar tasks
- **THEN** o sistema MUST exibir o progresso atualizado de todos os subjects sem necessidade de refresh manual
