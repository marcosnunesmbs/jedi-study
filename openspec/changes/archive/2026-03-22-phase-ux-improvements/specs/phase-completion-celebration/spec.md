## ADDED Requirements

### Requirement: Phase Completion Celebration
The system MUST display a visual celebration with confetti animation and an informative summary modal when a phase is completed.

#### Scenario: Fase concluída com sucesso
- **WHEN** a última task de uma fase é aprovada e a fase transita para COMPLETED
- **THEN** o sistema MUST disparar uma animação de confete na tela
- **AND** exibir um modal com título de parabéns
- **AND** o modal MUST conter: número de tasks completadas, score médio das submissões

#### Scenario: Próxima fase disponível
- **WHEN** o modal de celebração é exibido e existe uma próxima fase na trilha
- **THEN** o modal MUST incluir um botão "Próxima fase" que navega para a fase recém-desbloqueada

#### Scenario: Última fase da trilha
- **WHEN** o modal de celebração é exibido e a fase concluída é a última da trilha
- **THEN** o modal MUST exibir mensagem de conclusão da trilha completa
- **AND** incluir um botão para voltar à página do subject

#### Scenario: Não re-exibir celebração
- **WHEN** o usuário já visualizou a celebração de uma fase e navega de volta para ela
- **THEN** o sistema MUST NOT re-exibir o modal de celebração
