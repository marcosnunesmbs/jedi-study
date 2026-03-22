## ADDED Requirements

### Requirement: Admin user detail shows subjects count
O sistema DEVE exibir a quantidade de subjects que um usuário possui na página de detalhe do usuário no admin.

#### Scenario: User with subjects
- **WHEN** admin acessa a página de detalhe de um usuário que possui subjects
- **THEN** o sistema exibe a contagem de subjects no card principal

#### Scenario: User without subjects
- **WHEN** admin acessa a página de detalhe de um usuário que não possui subjects
- **THEN** o sistema exibe "0 subjects" no card principal

#### Scenario: API returns subjectsCount field
- **WHEN** a API retorna os dados do usuário
- **THEN** o campo `subjectsCount` está presente na resposta