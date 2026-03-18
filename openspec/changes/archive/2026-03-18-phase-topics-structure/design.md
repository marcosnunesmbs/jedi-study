## Context

Atualmente, o conteúdo educacional é gerado para a fase como um todo, resultando em explicações genéricas que tentam cobrir todos os objetivos da fase simultaneamente. A introdução de tópicos permitirá que o sistema decomponha uma fase em sub-unidades lógicas, permitindo que a IA gere conteúdo focado e o usuário estude de forma modular.

## Goals / Non-Goals

**Goals:**
- Adicionar suporte a tópicos lógicos em cada fase de estudo.
- Permitir que a geração de conteúdo seja focada em um tópico específico.
- Organizar a interface do usuário para exibir conteúdos agrupados por tópicos.

**Non-Goals:**
- Criar uma nova tabela para tópicos (manteremos como uma lista de strings dentro da fase para simplicidade inicial).
- Alterar o funcionamento básico de tarefas (tasks), que continuam pertencendo à fase.

## Decisions

- **Schema de Tópicos**: O campo `topics` em `Phase` será uma string contendo um array JSON de nomes de tópicos. Isso evita a complexidade de uma nova tabela e relacionamentos enquanto a estrutura ainda é experimental.
- **Associação de Conteúdo**: O modelo `Content` ganhará um campo `topic` opcional. Conteúdos sem tópico serão considerados "gerais da fase".
- **Prompt da IA**: O prompt do `content_gen` será modificado para aceitar o título do tópico e usá-lo como o foco principal da geração, mantendo os objetivos da fase como contexto secundário.
- **Interface UI**: A `PhasePage` será refatorada para iterar sobre a lista de tópicos e exibir os botões de geração e os conteúdos já gerados dentro do contexto de cada tópico.

## Risks / Trade-offs

- **Dados Legados**: Fases criadas anteriormente não terão tópicos.
  - **Mitigação**: O backend garantirá que `topics` retorne um array vazio por padrão e a UI tratará fases sem tópicos exibindo a estrutura antiga (apenas conteúdo geral).
- **Consistência de Nomenclatura**: O agente de geração de trilhas pode gerar nomes de tópicos ligeiramente diferentes em execuções futuras se não for bem controlado.
  - **Mitigação**: O `PathGenerator` definirá os tópicos no momento da criação da trilha e eles serão fixos para aquela instância.
- **Complexidade de UI**: Adicionar seções para cada tópico pode tornar a página longa.
  - **Mitigação**: Usar seções expansíveis (accordions) para manter a visão geral da fase limpa.
