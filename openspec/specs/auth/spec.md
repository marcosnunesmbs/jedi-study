# Auth Specification

## Purpose
Gerenciamento de autenticação e sessão de usuários na plataforma Jedi Study.

## Scope
O que está **incluído** nessa spec:
- Registro de novos usuários
- Login de usuários
- Recuperação de dados do usuário autenticado

O que está **fora do escopo**:
- Recuperação de senha (password reset)
- Login social (OAuth)
- Gerenciamento de papéis (RBAC avançado)

## Requirements

### Requirement: User Registration
The system MUST allow a user to register with an email, password, and optional display name.

#### Scenario: Registro com sucesso
- GIVEN um email válido e não cadastrado e uma senha com no mínimo 6 caracteres
- WHEN o usuário submete os dados de registro
- THEN o sistema cria a conta do usuário
- AND retorna um token de acesso ou confirmação

#### Scenario: Email já em uso
- GIVEN um email já cadastrado no sistema
- WHEN o usuário tenta se registrar com esse email
- THEN o sistema recusa a criação da conta
- AND retorna um erro de conflito ou validação

### Requirement: User Login
The system MUST authenticate a user with valid email and password credentials.

#### Scenario: Credenciais válidas
- GIVEN um usuário registrado
- WHEN o usuário submete seu email e senha corretos
- THEN o sistema autentica o usuário
- AND retorna um token de acesso para a sessão

#### Scenario: Credenciais inválidas
- GIVEN um usuário registrado
- WHEN o usuário submete uma senha incorreta ou email inexistente
- THEN o sistema recusa a autenticação
- AND retorna um erro de credenciais inválidas (Unauthorized)

### Requirement: Get Current User
The system MUST return the profile information of the currently authenticated user.

#### Scenario: Usuário logado acessa seu perfil
- GIVEN um usuário com um token de acesso válido
- WHEN o usuário solicita seus dados (endpoint /me)
- THEN o sistema retorna os detalhes do usuário logado

#### Scenario: Sincronização após alteração de perfil
- GIVEN um usuário que acabou de alterar seu nome de exibição
- WHEN o usuário solicita seus dados via endpoint /me ou recebe a resposta da atualização
- THEN os dados retornados DEVEM refletir o novo nome de exibição imediatamente

### Requirement: Route Protection
The system MUST reject requests to protected endpoints that do not carry a valid JWT token.

#### Scenario: Requisição sem token
- GIVEN um endpoint protegido da API
- WHEN uma requisição é enviada sem o header `Authorization: Bearer`
- THEN o sistema retorna HTTP 401 Unauthorized

#### Scenario: Token expirado ou inválido
- GIVEN um usuário com um token JWT vencido ou adulterado
- WHEN o usuário envia uma requisição com esse token
- THEN o sistema retorna HTTP 401 Unauthorized
- AND o cliente SHOULD redirecionar o usuário para a tela de login

### Requirement: Admin Seed on Initialization
The system SHALL create a default admin user on first boot if no admin user exists.

#### Scenario: Primeiro boot sem admin
- GIVEN um banco de dados sem nenhum usuário com role ADMIN
- WHEN a aplicação é inicializada
- THEN o sistema cria automaticamente um usuário administrador com credenciais padrão definidas no ambiente
- AND esse usuário possui role ADMIN e acesso aos endpoints administrativos
