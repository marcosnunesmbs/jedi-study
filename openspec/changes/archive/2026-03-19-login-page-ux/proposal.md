## Why

A página de login/registro não fornece feedback adequado ao usuário: erros de autenticação não persistem corretamente após a submissão, e o formulário de criação de conta não coleta nome nem valida a confirmação de senha — campos já suportados pela API mas nunca expostos na UI.

## What Changes

- Adicionar campo `displayName` (obrigatório) ao formulário de registro
- Adicionar campo `confirmPassword` ao formulário de registro com validação no `onBlur`
- Validar localmente se as senhas coincidem antes de chamar a API
- Limpar mensagem de erro ao alternar entre modos login/register
- Corrigir atributos `autoComplete` nos inputs para evitar interferência dos gerenciadores de senha do browser
- Passar `displayName` na chamada a `authApi.register()`

## Capabilities

### New Capabilities

Nenhuma nova capability — trata-se de melhoria de UX em funcionalidade existente.

### Modified Capabilities

- `auth`: o formulário de registro agora coleta `displayName` (obrigatório) e requer confirmação de senha antes de submeter

## Impact

- `apps/web/src/pages/LoginPage.tsx` — único arquivo alterado
- `apps/web/src/api/auth.api.ts` — sem alteração (já aceita `displayName?`)
- Sem impacto na API, banco de dados ou outros serviços
