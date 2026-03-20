## 1. Backend - Safety Validation

- [x] 1.1 Modificar SafetyService.validateInput() para aceitar goals como parâmetro
- [x] 1.2 Concatenar title + goals para validação completa no safety check

## 2. Backend - Subject Update Endpoint

- [x] 2.1 Adicionar UpdateSubjectDto em subjects.controller.ts com validação
- [x] 2.2 Adicionar método SubjectsService.update() para atualizar subject
- [x] 2.3 Adicionar endpoint PATCH /subjects/:id no controller

## 3. Frontend - API Update

- [x] 3.1 Adicionar método subjectsApi.update() em apps/web/src/api/subjects.api.ts

## 4. Frontend - Modal de Edição

- [x] 4.1 Modificar SubjectPage.tsx para incluir campos editáveis no modal
- [x] 4.2 Preencher campos com valores atuais do subject
- [x] 4.3 No submit: chamar PATCH subject primeiro, depois POST generate
- [x] 4.4 Tratar erros de validação do backend

## 5. Integração e Testes

- [x] 5.1 Testar endpoint PATCH /subjects/:id com dados válidos
- [x] 5.2 Testar endpoint PATCH /subjects/:id com dados inválidos
- [x] 5.3 Testar fluxo completo: editar subject + regenerar path
- [x] 5.4 Verificar que tokens são registrados corretamente na regeneração