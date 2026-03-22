## Why

A experiência do usuário na página de fase tem lacunas importantes: não há indicador de progresso agregado (% de tasks concluídas), não existe celebração visual ao completar uma fase, e os dados ficam stale em páginas anteriores (SubjectPage, DashboardPage) exigindo F5 manual para ver atualizações.

## What Changes

- Adicionar barra de progresso na PhasePage (acima dos objetivos) mostrando tasks PASSED / total tasks com percentual
- Exibir modal de celebração visual (confete via canvas-confetti) + resumo informativo ao completar uma fase, com botão para próxima fase
- Implementar invalidação em cascata no TaskPage: quando analysis.passed, invalidar também `['study-path-active', subjectId]` e `['subjects']`
- Configurar `refetchOnMount: 'always'` nas queries críticas de SubjectPage e DashboardPage

## Capabilities

### New Capabilities
- `phase-progress-display`: Exibição visual de progresso agregado da fase (barra de progresso + percentual)
- `phase-completion-celebration`: Celebração visual e informativa ao completar uma fase (confete + modal com resumo)

### Modified Capabilities
- `phases`: Adicionar requisitos de exibição de progresso e celebração na página de fase
- `tasks`: Adicionar requisito de invalidação em cascata de cache ao completar uma task

## Impact

- `apps/web/src/pages/PhasePage.tsx` — barra de progresso + modal de celebração
- `apps/web/src/pages/TaskPage.tsx` — invalidação em cascata de queries
- `apps/web/src/pages/SubjectPage.tsx` — refetchOnMount: 'always'
- `apps/web/src/pages/DashboardPage.tsx` — refetchOnMount: 'always'
- `apps/web/package.json` — nova dependência: canvas-confetti
