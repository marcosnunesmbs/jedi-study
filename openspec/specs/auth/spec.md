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
The system MUST allow a user to register with a display name (required), email, password, and password confirmation.

#### Scenario: Registro com sucesso
- GIVEN um email válido e não cadastrado, um nome de exibição preenchido e uma senha com no mínimo 6 caracteres
- WHEN o usuário preenche todos os campos e submete o formulário de registro
- THEN o sistema cria a conta com o nome de exibição informado
- AND retorna um token de acesso

#### Scenario: Email já em uso
- GIVEN um email já cadastrado no sistema
- WHEN o usuário tenta se registrar com esse email
- THEN o sistema recusa a criação da conta
- AND exibe a mensagem de erro retornada pela API abaixo do botão de submit
- AND os campos de email e nome permanecem preenchidos

#### Scenario: Senhas não coincidem
- GIVEN o usuário preencheu o campo de senha e está preenchendo o campo de confirmação
- WHEN o usuário sai do campo confirmação (onBlur) com um valor diferente da senha
- THEN o formulário exibe erro inline "Passwords don't match" abaixo do campo de confirmação
- AND o botão de submit fica desabilitado enquanto o erro de match persiste

#### Scenario: Senhas coincidem após correção
- GIVEN o campo de confirmação exibia erro de match
- WHEN o usuário corrige o valor para coincidir com a senha
- THEN o erro inline é removido
- AND o botão de submit volta a ficar habilitado

### Requirement: Form Error Reset on Mode Switch
The system MUST clear all error states when the user switches between login and register modes.

#### Scenario: Troca de modo limpa erros
- GIVEN uma mensagem de erro visível (API ou validação local)
- WHEN o usuário clica no link para alternar entre login e registro
- THEN todas as mensagens de erro são removidas do formulário
- AND o campo de confirmação de senha é limpo (no modo registro)

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
