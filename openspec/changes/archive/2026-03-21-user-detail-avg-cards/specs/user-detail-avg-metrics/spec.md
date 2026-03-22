## ADDED Requirements

### Requirement: Admin user detail shows average cost per subject
O sistema SHALL exibir na página de detalhe do usuário admin o custo médio por subject, calculado como `totalCostUsd / subjectsCount`.

#### Scenario: User with subjects
- **WHEN** admin visualiza detalhe de usuário que possui subjects
- **THEN** o sistema exibe card "Avg/Subject" com valor `totalCostUsd / subjectsCount` formatado como moeda

#### Scenario: User with no subjects
- **WHEN** admin visualiza detalhe de usuário com 0 subjects
- **THEN** o sistema exibe card "Avg/Subject" com valor zero formatado como moeda

### Requirement: Admin user detail shows average cost per call
O sistema SHALL exibir na página de detalhe do usuário admin o custo médio por chamada de agente, calculado como `totalCostUsd / totalCalls`.

#### Scenario: User with calls
- **WHEN** admin visualiza detalhe de usuário que possui chamadas registradas
- **THEN** o sistema exibe card "Avg/Call" com valor `totalCostUsd / totalCalls` formatado como moeda

#### Scenario: User with no calls
- **WHEN** admin visualiza detalhe de usuário com 0 chamadas
- **THEN** o sistema exibe card "Avg/Call" com valor zero formatado como moeda
