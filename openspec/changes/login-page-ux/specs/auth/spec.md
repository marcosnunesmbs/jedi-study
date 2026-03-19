## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: Form Error Reset on Mode Switch
The system MUST clear all error states when the user switches between login and register modes.

#### Scenario: Troca de modo limpa erros
- GIVEN uma mensagem de erro visível (API ou validação local)
- WHEN o usuário clica no link para alternar entre login e registro
- THEN todas as mensagens de erro são removidas do formulário
- AND o campo de confirmação de senha é limpo (no modo registro)
