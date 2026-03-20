## Context

O endpoint `GET /admin/users/:id` atualmente retorna dados do usuário e informações de uso de tokens. O frontend exibe essas informações na página `AdminUserDetailPage`. O usuário quer adicionar a contagem de subjects que o usuário possui.

## Goals / Non-Goals

**Goals:**
- Adicionar campo `subjectsCount` no retorno da API
- Exibir a contagem no card principal do usuário no frontend

**Non-Goals:**
- Não modificar outras páginas de admin
- Não adicionar funcionalidades de CRUD de subjects

## Decisões

### 1. Como obter a contagem de subjects

**Opção A**: Buscar o usuário com relação `subjects` e contar
- Prós: Simples
- Contras: Traz todos os subjects desnecessariamente

**Opção B**: Usar query com COUNT
- Prós: Mais eficiente, não traz dados desnecessários
- Contras: Requer uma query adicional

**Decisão**: Usar **Opção B** - Query com COUNT. Mais eficiente e não traz dados desnecessários.

### 2. Onde fazer a contagem

**Opção A**: No controller
- Prós: Simples
- Contras: Lógica de negócio no controller

**Opção B**: No service
- Prós: Separação de responsabilidades
- Contras: Mais código

**Decisão**: Usar **Opção B** - Adicionar método no service. Segue o padrão existente no código.

## Risks / Trade-offs

- **Risco**: Se a tabela de subjects for muito grande, a query pode ficar lenta → **Mitigação**: Adicionar índice na coluna `userId` se não existir
- **Trade-off**: Adicionar uma query adicional por requisição → **Mitigação**: A query é simples (COUNT), impacto mínimo