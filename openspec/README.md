# OpenSpec — Jedi Study

Especificações comportamentais do sistema, organizadas por domínio.

## Estrutura

### specs/
Source of truth — como o sistema atualmente se comporta.

| Domínio | Descrição |
|---------|-----------|
| [auth](specs/auth/spec.md) | Autenticação, proteção de rotas e seed de admin |
| [user-profile](specs/user-profile/spec.md) | Atualização de nome e senha do usuário |
| [subjects](specs/subjects/spec.md) | Gerenciamento de assuntos e objetivos do aluno |
| [study-paths](specs/study-paths/spec.md) | Geração assíncrona e versionamento de trilhas de estudo |
| [phases](specs/phases/spec.md) | Sequenciamento, unlock e conclusão de fases |
| [tasks](specs/tasks/spec.md) | Submissão, análise por IA e aprovação de tarefas |
| [content](specs/content/spec.md) | Geração de conteúdo educacional e streaming via SSE |
| [token-usage](specs/token-usage/spec.md) | Monitoramento admin de consumo de tokens e custos de IA |
| [infrastructure](specs/infrastructure/spec.md) | Serviços externos, migrations, filas e ordem de startup |

### changes/
Modificações propostas. Cada change vive em sua própria pasta até ser mergeada.

## Convenções

- Requisitos usam keywords RFC 2119 (SHALL, MUST, SHOULD, MAY)
- Cenários seguem formato Given/When/Then
- Specs descrevem **comportamento**, não implementação
