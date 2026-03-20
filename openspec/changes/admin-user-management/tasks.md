## 1. Backend: Data Model & Migration

- [x] 1.1 Adicionar `@DeleteDateColumn() deletedAt: Date;` na entidade `User`.
- [x] 1.2 Criar e aplicar migração do TypeORM para adicionar a coluna `deletedAt` no banco.
- [x] 1.3 Atualizar o `AuthService.validateUser` (ou similar) para rejeitar usuários deletados.

## 2. Backend: API Administrativa (AdminUsersController)

- [x] 2.1 Criar `AdminUsersController` com proteção `RolesGuard(UserRole.ADMIN)`.
- [x] 2.2 Implementar `GET /admin/users` com paginação (page, limit) e filtros (search, role, withDeleted).
- [x] 2.3 Criar DTO para criação de usuário pelo Admin (email, displayName, role).
- [x] 2.4 Implementar `POST /admin/users` com geração de senha aleatória e retorno em texto plano.
- [x] 2.5 Implementar `PATCH /admin/users/:id/reset-password` com geração de nova senha aleatória.
- [x] 2.6 Implementar `DELETE /admin/users/:id` para soft delete individual.
- [x] 2.7 Implementar `DELETE /admin/users/bulk` para soft delete em massa.

## 3. Backend: Validação de Senha Forte

- [x] 3.1 Criar decorator ou utilitário de validação de senha (8+ chars, letras e números).
- [x] 3.2 Aplicar validação no `RegisterDto` (Auth).
- [x] 3.3 Aplicar validação no `UpdatePasswordDto` (User Profile).
- [x] 3.4 Validar se o gerador de senhas aleatórias do Admin atende aos critérios.

## 4. Frontend: Base & Navegação

- [x] 4.1 Adicionar rota `/admin/users` no `App.tsx` usando `AdminRoute`.
- [x] 4.2 Adicionar link "Users" no sidebar do `AppShell.tsx` (visível apenas para ADMIN).
- [x] 4.3 Implementar utilitário de validação de força de senha no frontend (regex).

## 5. Frontend: Interface Administrativa

- [x] 5.1 Criar página `AdminUsersPage.tsx` com estrutura de tabela (TanStack Table recomendada).
- [x] 5.2 Implementar componentes de Paginação e Busca na tabela.
- [x] 5.3 Implementar Filtros de Role e Status (Show Deleted).
- [x] 5.4 Adicionar checkboxes na tabela e botão "Bulk Delete" com confirmação.
- [x] 5.5 Criar modal "Create User" com formulário e exibição da senha gerada.
- [x] 5.6 Criar modal de confirmação "Reset Password" com exibição da nova senha.
- [x] 5.7 Adicionar feedback visual de "Senha Forte" nos formulários de Registro e Profile.
