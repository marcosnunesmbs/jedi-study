## Context

A `LoginPage.tsx` é um único componente React que gerencia tanto login quanto registro via estado local (`mode: 'login' | 'register'`). O formulário já possui estado para `email`, `password`, `error` e `loading`, mas não possui `displayName` nem `confirmPassword`. A API já aceita `displayName` opcionalmente no registro — só precisa ser exposto na UI.

O problema do "reload/sumiço de email" é causado por gerenciadores de senha do browser que detectam falha de autenticação e sobrepõem os campos. Isso é resolvido com atributos `autoComplete` corretos.

## Goals / Non-Goals

**Goals:**
- Adicionar `displayName` (obrigatório) e `confirmPassword` ao modo register
- Validar match de senhas no `onBlur` do campo confirm, sem chamar a API
- Limpar erro ao trocar de modo (login ↔ register)
- Atributos `autoComplete` corretos para evitar interferência do browser

**Non-Goals:**
- Refatorar o componente para separar login e register em arquivos distintos
- Adicionar validação de força de senha
- Internacionalização das mensagens de erro

## Decisions

**D1 — Validação de confirmação no `onBlur`, não no `onChange`**
Validar a cada tecla seria irritante ("senhas não coincidem" enquanto ainda se digita). O `onBlur` dispara ao sair do campo, momento em que o usuário espera feedback. Alternativa considerada: só no submit — descartada pois o feedback tardio piora UX.

**D2 — `displayName` obrigatório com `required` HTML + validação no submit**
O campo terá `required` nativo. Sem validação customizada adicional — o comportamento padrão do browser é suficiente para esse campo simples.

**D3 — Limpar `confirmPassword` e `passwordMatchError` ao trocar de modo**
Ao clicar em "Sign In" / "Create account", resetar: `setConfirmPassword('')`, `setPasswordMatchError('')`, `setError('')`. Email e password NÃO são resetados — o usuário pode querer reutilizá-los.

**D4 — Estado `passwordMatchError` separado de `error`**
`error` é reservado para erros da API (credenciais inválidas, email em uso, etc.). `passwordMatchError` é um erro de validação local visível inline abaixo do campo confirm. Mantê-los separados evita que o erro local seja sobrescrito por uma resposta da API.

## Risks / Trade-offs

- [Browser autofill em `confirmPassword`] → `autoComplete="new-password"` no campo de confirmação instrui o browser a não preencher automaticamente
- [displayName obrigatório quebra UX para usuários que só querem email+senha] → Decisão do produto — aceita conforme alinhado
