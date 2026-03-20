## Why

Atualmente, quando o usuário deseja regenerar um study path, ele não consegue editar os dados do subject (título, nível, objetivos) antes de gerar o novo path. O sistema usa os dados existentes diretamente, sem possibilidade de alteração. Isso limita a flexibilidade do usuário que pode querer ajustar seus objetivos ou nível de habilidade antes de regenerar a trilha.

## What Changes

1. **Novo endpoint PATCH /subjects/:id** - Permite atualizar título, skillLevel e goals de um subject
2. **Validação de segurança para goals** - O SafetyService agora valida tanto o título quanto os goals antes de gerar o path
3. **Frontend: Modal de edição** - O modal de "Regenerate Path" agora inclui campos editáveis pré-preenchidos com os valores atuais do subject
4. **Frontend: API update** - Novo método subjectsApi.update() para enviar as alterações

## Capabilities

### New Capabilities
- **edit-subject**: Capacidade de editar os dados de um subject (título, nível, objetivos) antes de regenerar o path. Cria `specs/edit-subject/spec.md`

### Modified Capabilities
- **subjects**: Adicionar requisito de edição (Update Subject) à spec existente
- **input-safety**: Modificar validação para incluir goals além do título

## Impact

- **Backend**: Novos arquivos em `apps/api/src/modules/subjects/`
- **Frontend**: Atualização em `apps/web/src/pages/SubjectPage.tsx` e novo método em `apps/web/src/api/subjects.api.ts`
- **Safety**: Modificação em `apps/api/src/modules/agents/safety.service.ts`