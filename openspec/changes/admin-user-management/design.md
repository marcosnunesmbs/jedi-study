## Context

Atualmente, o sistema possui papéis (`USER`, `ADMIN`) e guards de proteção, mas não há interface ou endpoints para o administrador gerenciar outros usuários. As senhas não possuem validação de complexidade forte e a deleção de usuários é física (ou inexistente via API), o que pode causar perda de dados históricos.

## Goals / Non-Goals

**Goals:**
- Implementar Soft Delete na entidade `User`.
- Criar endpoints administrativos protegidos para CRUD de usuários.
- Implementar listagem paginada com filtros no backend.
- Desenvolver a interface de gerenciamento no frontend.
- Unificar a política de senha forte (8+ chars, letras e números).

**Non-Goals:**
- Implementar MFA (Multi-factor authentication).
- Implementar login social nesta fase.
- Permitir que admins vejam senhas existentes (apenas reset).

## Decisions

### 1. Soft Delete com TypeORM
- **Decisão**: Usar `@DeleteDateColumn()` na entidade `User`.
- **Racional**: Permite que o TypeORM oculte registros deletados por padrão em queries normais (preservando integridade referencial em `StudyPath` e `TokenUsage`), mas permite que o Admin os veja usando `.withDeleted()`.

### 2. Controlador Administrativo Separado vs Extensão do Existente
- **Decisão**: Criar um novo controlador `AdminUsersController` ou prefixar rotas administrativas no `UsersController` com `/admin/users`.
- **Racional**: Facilita a aplicação do `RolesGuard(UserRole.ADMIN)` em nível de classe, garantindo que nenhum endpoint administrativo vaze para usuários comuns.

### 3. Geração de Senha Aleatória
- **Decisão**: Usar a biblioteca `crypto` do Node.js para gerar strings seguras e aleatórias.
- **Racional**: Garante senhas imprevisíveis que atendem aos novos requisitos de complexidade.

### 4. Paginação no Backend
- **Decisão**: Offset-based pagination (`page`, `limit`).
- **Racional**: Simples de implementar com TypeORM e suficiente para o volume de usuários esperado nesta fase.

### 5. Bulk Delete
- **Decisão**: Endpoint `DELETE /admin/users/bulk` aceitando um array de IDs.
- **Racional**: Reduz o número de chamadas de rede ao realizar ações em massa na interface.

## Risks / Trade-offs

- **[Risco] Senha vista uma única vez** → Se o admin fechar o modal sem copiar, precisará resetar novamente.
  - **Mitigação**: Adicionar um botão de "Copy to Clipboard" proeminente e um aviso visual claro no modal.
- **[Risco] Complexidade de Senha Retroativa** → Usuários antigos podem ter senhas fracas.
  - **Mitigação**: A regra de senha forte será aplicada apenas em novos cadastros, trocas de senha e resets administrativos. Não forçaremos reset global imediato (out of scope).
- **[Trade-off] Soft Delete vs Espaço em Disco** → Registros nunca são removidos.
  - **Racional**: O volume de dados de usuários é pequeno comparado aos logs de tokens e conteúdos gerados por IA, o benefício da integridade histórica supera o custo de armazenamento.
