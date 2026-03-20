## 1. Estado do formulário

- [x] 1.1 Adicionar state `displayName` e `confirmPassword` ao componente
- [x] 1.2 Adicionar state `passwordMatchError` separado do `error` da API
- [x] 1.3 Resetar `confirmPassword`, `passwordMatchError` e `error` ao trocar de modo (login ↔ register)

## 2. Campos do formulário de registro

- [x] 2.1 Adicionar campo "Name" (`displayName`) com `required`, `autoComplete="name"`, visível apenas no modo register
- [x] 2.2 Adicionar campo "Confirm Password" com `autoComplete="new-password"`, visível apenas no modo register
- [x] 2.3 Implementar handler `onBlur` no campo confirm que seta `passwordMatchError` se os valores divergirem
- [x] 2.4 Exibir `passwordMatchError` inline abaixo do campo confirm (separado do erro da API)

## 3. Lógica de submit

- [x] 3.1 No modo register, bloquear submit se `passwordMatchError` não estiver vazio ou se `confirmPassword !== password`
- [x] 3.2 Passar `displayName` na chamada a `authApi.register(email, password, displayName)`

## 4. Atributos de autoComplete

- [x] 4.1 Campo email: `autoComplete="email"`
- [x] 4.2 Campo password (login): `autoComplete="current-password"`
- [x] 4.3 Campo password (register): `autoComplete="new-password"`
- [x] 4.4 Campo confirm password: `autoComplete="new-password"`
