## MODIFIED Requirements

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
