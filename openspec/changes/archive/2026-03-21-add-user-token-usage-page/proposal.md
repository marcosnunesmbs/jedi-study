## Why

Os administradores atualmente não conseguem visualizar o consumo de tokens de IA por usuário individual. Na página de Admin Users, falta transparência sobre quanto cada usuário está custando em termos de chamadas de API e custos financeiros. Isso dificulta o monitoramento de uso e planejamento de custos.

## What Changes

1. **Criar endpoint `GET /admin/users/:id`** - Retorna dados do usuário + agregação de token usage
2. **Criar página de detalhes do usuário** em `/admin/users/:id` - Exibe custos detalhados por agente
3. **Adicionar colunas de token usage na listagem de usuários** - Input tokens, output tokens, calls, custo total

## Capabilities

### New Capabilities
- `user-token-usage`: Capacidade de visualizar consumo de tokens por usuário individual, com breakdown por agente (PATH_GENERATOR, CONTENT_GEN, TASK_ANALYZER, PROJECT_ANALYZER, SAFETY)

### Modified Capabilities
- Nenhuma modificação de requisitos existentes

## Impact

- **Backend**: Novo endpoint em `apps/api/src/modules/users/admin-users.controller.ts`
- **Frontend**: Nova página em `apps/web/src/pages/AdminUserDetailPage.tsx`
- **Database**: Sem mudanças (usa tabela TokenUsage existente)