# Admin Management Specification

## ADDED Requirements

### Requirement: List Users with Pagination and Filters
O sistema DEVE permitir que administradores listem todos os usuários cadastrados, com suporte a paginação, busca por nome/email e filtros por papel (role) e status (incluindo usuários deletados).

#### Scenario: Listagem paginada padrão
- **WHEN** o administrador acessa a página de usuários
- **THEN** o sistema retorna a primeira página (10 registros por padrão)
- **AND** exibe os controles de navegação entre páginas

#### Scenario: Busca por texto
- **WHEN** o administrador digita um termo no campo de busca
- **THEN** o sistema filtra a lista para exibir apenas usuários cujo nome ou email contenha o termo digitado

#### Scenario: Filtro por papel
- **WHEN** o administrador seleciona o papel "ADMIN" no filtro
- **THEN** o sistema exibe apenas os usuários com permissão de administrador

#### Scenario: Filtro de usuários deletados
- **WHEN** o administrador ativa o filtro "Show Deleted"
- **THEN** o sistema inclui usuários marcados com soft delete na listagem
- **AND** esses usuários DEVEM ser visualmente distintos (badge "Deleted")

### Requirement: Admin Create User with Auto-generated Password
O sistema DEVE permitir que um administrador crie um novo usuário, gerando uma senha forte aleatória que será exibida uma única vez para o administrador.

#### Scenario: Criação com sucesso
- **WHEN** o administrador preenche email, nome e papel do novo usuário e submete
- **THEN** o sistema cria o usuário no banco de dados
- **AND** gera uma senha forte aleatória (8+ caracteres, letras e números)
- **AND** retorna a senha em texto plano para o administrador copiar

### Requirement: Admin Reset User Password
O sistema DEVE permitir que um administrador resete a senha de qualquer usuário, gerando uma nova senha forte aleatória.

#### Scenario: Reset de senha com sucesso
- **WHEN** o administrador clica em "Reset Password" para um usuário específico
- **THEN** o sistema gera uma nova senha forte aleatória
- **AND** atualiza o hash da senha do usuário no banco
- **AND** retorna a nova senha em texto plano para o administrador

### Requirement: Soft Delete and Bulk Delete
O sistema DEVE suportar a deleção lógica (soft delete) de usuários, permitindo a exclusão de um ou vários usuários simultaneamente.

#### Scenario: Deleção individual
- **WHEN** o administrador confirma a exclusão de um usuário
- **THEN** o sistema marca o registro com a data de deleção (deletedAt)
- **AND** o usuário perde acesso imediato ao sistema

#### Scenario: Deleção em massa (Bulk)
- **WHEN** o administrador seleciona múltiplos usuários e clica em "Delete Selected"
- **THEN** o sistema aplica o soft delete em todos os IDs selecionados
