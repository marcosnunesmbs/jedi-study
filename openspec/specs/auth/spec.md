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
