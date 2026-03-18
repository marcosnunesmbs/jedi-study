## 1. Banco de Dados e Agentes (Backend Python)

- [x] 1.1 Atualizar o `prisma/schema.prisma` adicionando `topics` em `Phase` e `topic` em `Content`
- [x] 1.2 Executar a migração do Prisma (`npx prisma migrate dev`)
- [x] 1.3 Atualizar o `output_schema.py` do `path_generator` para incluir o campo `topics` em `PathPhase`
- [x] 1.4 Atualizar o `SYSTEM_PROMPT` do `path_generator` para instruir a IA a gerar tópicos relevantes para cada fase
- [x] 1.5 Atualizar a função `generate_content` e o `build_prompt` em `content_gen` para aceitar um parâmetro opcional de tópico

## 2. API e Lógica de Negócio (Backend NestJS)

- [x] 2.1 Atualizar o `ContentService` para aceitar o campo `topic` na criação de conteúdo e passar para a fila do Bull
- [x] 2.2 Modificar o processador da fila `content-generation` (no microserviço de agentes ou na API) para lidar com o novo campo de tópico
- [x] 2.3 Garantir que o `PhasesService` retorne os tópicos parseados corretamente do JSON armazenado no banco
- [x] 2.4 Validar o retorno da API no endpoint de detalhes da fase para incluir a estrutura de tópicos

## 3. Interface do Usuário (Frontend React)

- [x] 3.1 Atualizar os tipos de `Phase` e `Content` no cliente de API do frontend
- [x] 3.2 Refatorar a `PhasePage.tsx` para agrupar conteúdos existentes por tópico
- [x] 3.3 Implementar seções (accordions) para cada tópico na `PhasePage`
- [x] 3.4 Adicionar botões de geração de conteúdo específicos para cada tópico
- [x] 3.5 Ajustar o componente de conteúdo (ou `ContentPage`) para exibir a qual tópico aquele conteúdo se refere, se aplicável

## 4. Verificação e Testes

- [x] 4.1 Gerar uma nova trilha de estudos e verificar se os tópicos foram criados corretamente no banco
- [x] 4.2 Gerar uma explicação para um tópico específico e validar se o conteúdo gerado é focado e está associado ao tópico correto
- [x] 4.3 Abrir uma fase antiga (sem tópicos) e garantir que o sistema não quebra e exibe os conteúdos gerais corretamente
