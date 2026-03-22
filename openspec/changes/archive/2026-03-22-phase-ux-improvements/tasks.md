## 1. Dependências

- [x] 1.1 Instalar canvas-confetti no apps/web (`npm install canvas-confetti && npm install -D @types/canvas-confetti`)

## 2. Barra de Progresso na PhasePage

- [x] 2.1 Criar componente de barra de progresso com cálculo de tasks PASSED / total e exibição de percentual (ex: "2/5 tasks (40%)")
- [x] 2.2 Inserir barra de progresso na PhasePage acima da seção de objetivos

## 3. Celebração de Conclusão de Fase

- [x] 3.1 Criar modal de celebração com confete (canvas-confetti) + resumo informativo (tasks completadas, score médio)
- [x] 3.2 Implementar detecção de transição de fase para COMPLETED via useRef para disparar celebração
- [x] 3.3 Adicionar lógica de não re-exibir celebração (sessionStorage com phaseId)
- [x] 3.4 Implementar botão "Próxima fase" no modal (navega para fase desbloqueada) e variante "Trilha concluída" para última fase

## 4. Invalidação de Cache em Cascata

- [x] 4.1 No TaskPage, quando analysis.passed, invalidar adicionalmente ['study-path-active'] e ['subjects']
- [x] 4.2 Configurar refetchOnMount: 'always' na query de study-path-active na SubjectPage
- [x] 4.3 Configurar refetchOnMount: 'always' na query de subjects na DashboardPage
