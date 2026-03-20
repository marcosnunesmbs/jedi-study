## 1. Backend

- [x] 1.1 Adicionar método `getSubjectsCount` no `UsersService` que retorna a contagem de subjects usando query com COUNT
- [x] 1.2 Modificar o endpoint `GET /admin/users/:id` no `AdminUsersController` para incluir `subjectsCount` na resposta

## 2. Frontend

- [x] 2.1 Adicionar campo `subjectsCount` na interface `UserWithTokenUsage` em `users.api.ts`
- [x] 2.2 Exibir a contagem de subjects no card principal da página `AdminUserDetailPage` (ao lado do badge de role)