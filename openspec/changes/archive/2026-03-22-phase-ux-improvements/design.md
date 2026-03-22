## Context

A PhasePage exibe tasks com badges de status individuais, mas não agrega progresso. Não há feedback visual ao completar uma fase. O React Query invalida apenas `phase` e `task` ao completar uma task — queries de `study-path-active` e `subjects` ficam stale, exigindo F5 manual.

O app usa React Query com `staleTime: 5min` global, polling condicional (3s) para operações async, e não possui WebSockets.

## Goals / Non-Goals

**Goals:**
- Exibir barra de progresso com % na PhasePage (acima dos objetivos)
- Celebrar conclusão de fase com modal visual (confete) + resumo informativo
- Garantir que dados atualizem automaticamente em todas as páginas afetadas

**Non-Goals:**
- Implementar WebSockets ou SSE para real-time
- Alterar a API backend (tudo client-side)
- Mudar a lógica de phase unlock (já funciona corretamente no backend)

## Decisions

### 1. Barra de progresso: cálculo client-side

A PhasePage já recebe `phase.tasks` com status de cada task. O cálculo de progresso será feito no componente: `tasks.filter(t => t.status === 'PASSED').length / tasks.length * 100`.

**Alternativa descartada:** Endpoint dedicado no backend — overhead desnecessário, os dados já estão disponíveis.

### 2. Celebração: canvas-confetti + modal customizado

Usar `canvas-confetti` (~3KB gzipped) para efeito visual e um modal Tailwind com resumo da fase (tasks completadas, score médio das submissões).

**Alternativa descartada:** Lottie animations — muito pesado (~50KB+) para um efeito pontual.

**Detecção de conclusão:** Comparar status anterior da fase com o atual via `useRef`. Quando `phase.status` transita de não-COMPLETED para COMPLETED, disparar celebração. Isso evita re-trigger em re-renders e navegação.

### 3. Invalidação em cascata: estratégia A+B

**A) Invalidação explícita no TaskPage:** Quando `analysis.passed === true`, invalidar adicionalmente:
- `['study-path-active', subjectId]` — atualiza lista de fases na SubjectPage
- `['subjects']` — atualiza progresso no DashboardPage

O `subjectId` será obtido do objeto `task` retornado pela API (via `task.phase.studyPath.subjectId` ou similar). Se não disponível diretamente, será extraído da URL/route params.

**B) refetchOnMount nas páginas de listagem:** Configurar `refetchOnMount: 'always'` em:
- SubjectPage: query `['study-path-active', subjectId]`
- DashboardPage: query `['subjects']`

Isso garante dados frescos ao navegar de volta, mesmo sem invalidação explícita.

**Alternativa descartada:** Polling contínuo nessas páginas — gasto desnecessário de requests quando o usuário não está fazendo tasks.

### 4. Modal de celebração: navegação para próxima fase

O modal incluirá um botão "Próxima fase" que navega para a fase recém-desbloqueada. Se for a última fase da trilha, exibirá mensagem de conclusão da trilha com botão para voltar ao subject.

## Risks / Trade-offs

- **[Detecção de conclusão via useRef]** → Se o componente re-montar (navegação), o ref reseta. Mitigação: verificar `phase.status === 'COMPLETED'` e usar um flag no sessionStorage com o phaseId para não re-exibir.
- **[subjectId pode não estar no task response]** → Mitigação: extrair da URL/route params como fallback, ou fazer invalidação mais ampla com `queryClient.invalidateQueries({ queryKey: ['study-path-active'] })` sem filtro de subjectId.
- **[canvas-confetti como dependência extra]** → Trade-off aceito: ~3KB gzipped, sem manutenção, amplamente usado. Alternativa seria CSS animations puras, mas o efeito seria inferior.
