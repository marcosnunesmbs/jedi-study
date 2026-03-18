# OpenSpec — Jedi Study

Especificações comportamentais do sistema, organizadas por domínio.

## Estrutura

### specs/
Source of truth — como o sistema atualmente se comporta.

| Domínio | Descrição |
|---------|-----------|
| [auth](specs/auth/spec.md) | Autenticação e gerenciamento de sessão |
| [subjects](specs/subjects/spec.md) | Gerenciamento de assuntos e objetivos do aluno |
| [study-paths](specs/study-paths/spec.md) | Geração de trilhas de estudo por Inteligência Artificial |
| [phases](specs/phases/spec.md) | Execução e conteúdo das fases de estudo |
| [tasks](specs/tasks/spec.md) | Avaliação automatizada de tarefas do aluno |
| [token-usage](specs/token-usage/spec.md) | Monitoramento de consumo de tokens de IA |

### changes/
Modificações propostas. Cada change vive em sua própria pasta até ser mergeada.

## Convenções

- Requisitos usam keywords RFC 2119 (SHALL, MUST, SHOULD, MAY)
- Cenários seguem formato Given/When/Then
- Specs descrevem **comportamento**, não implementação
