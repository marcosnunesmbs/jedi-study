## Why

Na página de detalhe de usuário do admin (`/admin/users/:id`), atualmente não há informação sobre quantos subjects o usuário possui. Isso dificulta o admin de ter uma visão rápida do engajamento do usuário na plataforma.

## What Changes

- **Backend**: Adicionar campo `subjectsCount` no retorno do endpoint `GET /admin/users/:id`
- **Frontend**: Exibir o número de subjects no card principal do usuário, ao lado do badge de role

## Capabilities

### New Capabilities
- `admin-user-subjects-count`: Exibir quantidade de subjects na página de detalhe do usuário admin

### Modified Capabilities
(nenhum)

## Impact

- **API**: Modificação no controller `AdminUsersController` e service `UsersService`
- **Frontend**: Modificação na página `AdminUserDetailPage` e no tipo `UserWithTokenUsage` em `users.api.ts`