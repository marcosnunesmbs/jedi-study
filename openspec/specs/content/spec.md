# Content Specification

## Purpose
Geração assíncrona de conteúdo educacional com IA para fases da trilha de estudos, com entrega via Server-Sent Events (SSE).

## Scope
O que está **incluído** nessa spec:
- Solicitação de geração de conteúdo educacional para uma fase
- Tipos de conteúdo suportados (EXPLANATION, EXAMPLE, SUMMARY, RESOURCE_LIST, CUSTOM)
- Consulta e streaming de status da geração via SSE
- Ciclo de vida do conteúdo (PENDING → STREAMING → COMPLETE | ERROR)

O que está **fora do escopo**:
- Geração da estrutura da fase (coberto em study-paths)
- Submissão e avaliação de tarefas (coberto em tasks)

## Requirements

### Requirement: Generate Phase Content
The system MUST allow an authenticated user to request AI-generated educational content for a phase, specifying the content type and an optional topic.

#### Scenario: Solicitação de conteúdo bem-sucedida
- GIVEN um usuário autenticado e uma fase que lhe pertence
- WHEN o usuário solicita geração de conteúdo com um tipo válido (EXPLANATION, EXAMPLE, SUMMARY, RESOURCE_LIST ou CUSTOM)
- THEN o sistema registra a solicitação com status PENDING
- AND enfileira o job de geração assíncrona
- AND retorna imediatamente o `contentId` ao usuário

#### Scenario: Conteúdo focado em tópico específico
- GIVEN uma fase com múltiplos tópicos definidos
- WHEN o usuário solicita conteúdo especificando um `topic`
- THEN o sistema gera o conteúdo focado naquele tópico específico
- AND associa o conteúdo ao tópico na fase

#### Scenario: Conteúdo customizado com prompt
- GIVEN um usuário autenticado
- WHEN o usuário solicita conteúdo do tipo CUSTOM fornecendo um `customPrompt`
- THEN o sistema usa o `customPrompt` como instrução adicional para a IA
- AND gera conteúdo alinhado à instrução fornecida

#### Scenario: Acesso negado a fase de outro usuário
- GIVEN um usuário autenticado
- WHEN o usuário solicita geração de conteúdo para uma fase que não lhe pertence
- THEN o sistema retorna erro de não autorizado ou não encontrado

### Requirement: Content Status Lifecycle
The system MUST transition content through a defined lifecycle: PENDING → STREAMING → COMPLETE or ERROR.

#### Scenario: Processamento bem-sucedido
- GIVEN um conteúdo com status PENDING na fila
- WHEN o worker inicia o processamento
- THEN o sistema atualiza o status para STREAMING
- AND ao concluir a geração, atualiza o corpo do conteúdo e status para COMPLETE

#### Scenario: Falha na geração
- GIVEN um job de geração em STREAMING
- WHEN o Agents Service ou a API do Gemini retorna erro após esgotamento de tentativas
- THEN o sistema atualiza o status do conteúdo para ERROR
- AND registra o erro no AgentJob correspondente

### Requirement: Get Content
The system MUST return the full content data for an authenticated user who owns the associated phase.

#### Scenario: Conteúdo já gerado
- GIVEN um usuário autenticado e um `contentId` cujo conteúdo está COMPLETE
- WHEN o usuário solicita o conteúdo pelo ID
- THEN o sistema retorna o corpo em Markdown e os metadados do conteúdo

#### Scenario: Acesso negado
- GIVEN um usuário autenticado
- WHEN o usuário solicita um conteúdo que pertence a outro usuário
- THEN o sistema retorna erro de não autorizado ou não encontrado

### Requirement: Stream Content Status via SSE
The system MUST provide a Server-Sent Events (SSE) endpoint that streams the status of a content generation job until completion.

#### Scenario: Streaming até conclusão
- GIVEN um conteúdo com geração em andamento
- WHEN o usuário conecta ao endpoint SSE com um token JWT válido
- THEN o sistema envia eventos de status periodicamente
- AND ao atingir o status COMPLETE, envia o corpo do conteúdo no payload do evento
- AND encerra a conexão SSE

#### Scenario: Autenticação via query param
- GIVEN que o protocolo SSE (EventSource) não suporta headers HTTP customizados
- WHEN o usuário conecta ao endpoint de stream
- THEN o sistema aceita o token JWT via query parameter `?token=<jwt>`
- AND valida o token antes de iniciar o stream

#### Scenario: Conteúdo em estado de erro
- GIVEN um conteúdo que entrou em status ERROR durante a geração
- WHEN o usuário está conectado ao SSE ou se conecta após o erro
- THEN o sistema envia um evento de erro
- AND encerra a conexão SSE
