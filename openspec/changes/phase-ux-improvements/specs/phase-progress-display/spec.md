## ADDED Requirements

### Requirement: Phase Progress Bar
The system MUST display a visual progress bar with percentage on the Phase page, positioned above the objectives section.

#### Scenario: Progresso parcial
- **WHEN** o usuário visualiza uma fase com 2 de 5 tasks com status PASSED
- **THEN** o sistema exibe uma barra de progresso preenchida em 40%
- **AND** exibe o texto "2/5 tasks (40%)"

#### Scenario: Nenhuma task completa
- **WHEN** o usuário visualiza uma fase sem nenhuma task PASSED
- **THEN** o sistema exibe a barra de progresso vazia (0%)
- **AND** exibe o texto "0/N tasks (0%)"

#### Scenario: Todas as tasks completas
- **WHEN** o usuário visualiza uma fase com todas as tasks PASSED
- **THEN** o sistema exibe a barra de progresso totalmente preenchida (100%)

#### Scenario: Atualização em tempo real
- **WHEN** uma task transita para PASSED enquanto o usuário está na PhasePage
- **THEN** a barra de progresso MUST atualizar automaticamente sem necessidade de refresh manual
