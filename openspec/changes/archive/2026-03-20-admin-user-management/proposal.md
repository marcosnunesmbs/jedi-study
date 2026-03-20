## Why

A plataforma precisa de uma interface administrativa para gerenciar usuários, permitindo que administradores criem, resetem senhas e gerenciem o ciclo de vida (ativação/desativação) de contas sem intervenção direta no banco de dados. Isso garante melhor governança e suporte aos usuários.

## What Changes

- **Interface de Gerenciamento**: Nova página exclusiva para ADMIN para listagem, busca e filtragem de usuários.
- **Paginação e Busca**: Implementação de paginação no backend e busca textual/filtros por role e status.
- **Criação de Usuário pelo Admin**: Fluxo onde o admin cria o usuário e recebe uma senha gerada automaticamente (vista uma única vez).
- **Reset de Senha**: Admin pode resetar a senha de qualquer usuário, seguindo a mesma lógica de geração automática.
- **Soft Delete**: Usuários deletados não são removidos do banco, mas marcados como deletados para preservar histórico de estudos e uso de tokens.
- **Ações em Massa (Bulk)**: Possibilidade de selecionar múltiplos usuários para deleção.
- **Validação de Senha Forte**: **BREAKING** (Novos requisitos) - Obrigatoriedade de 8+ caracteres, incluindo letras e números para todas as senhas (novas ou resetadas).

## Capabilities

### New Capabilities
- `admin-management`: Gerenciamento centralizado de usuários, incluindo CRUD administrativo, listagem paginada, filtros de busca e ações em massa.

### Modified Capabilities
- `auth`: Adição de requisitos de complexidade de senha (8+ chars, letras e números) e suporte a usuários criados por admin.
- `user-profile`: Requisito de senha forte também se aplica à troca de senha pelo próprio usuário.

## Impact

- **API**: Novos endpoints em `/users/admin` (ou similar), atualização do `UserEntity` para Soft Delete, novos DTOs de validação.
- **Web**: Nova rota `/admin/users`, novo componente de tabela com paginação/bulk, modais de criação/reset de senha, feedback visual de força de senha.
- **DB**: Migração para adicionar `deletedAt` na tabela de usuários.
