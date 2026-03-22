## Why

Atualmente os modelos de IA são configurados via variáveis de ambiente (ENV), o que exige rebuild/redeploy para alterar. Além disso, não há visibilidade de custos por modelo usado - o sistema calcula o custo no momento da execução mas não permite gestão centralizada de precificação nem visualização de uso por modelo.

## What Changes

- Criar tabela `ModelPrice` para cadastrar modelos com nome e preços (input/output por 1M tokens)
- Criar tabela `AgentModelConfig` para configurar qual modelo cada tipo de agente deve usar
- Criar painel admin para CRUD de modelos e configurações de agente
- Modificar o backend para injetar o modelo configurado nas chamadas aos agentes
- Modificar os agentes para usar o modelo recebido na requisição (em vez de ler do ENV)
- Adicionar visão "Usage by Model" na página de Token Usage do admin
- Manter apenas a API key do Google no ENV (GOOGLE_API_KEY)

## Capabilities

### New Capabilities

- `model-price-management`: Sistema de cadastro e gestão de modelos de IA com precificação
- `agent-model-configuration`: Configuração de qual modelo cada tipo de agente utiliza
- `token-usage-by-model`: Visualização de consumo de tokens agrupado por modelo

### Modified Capabilities

- `token-usage-tracking`: Adicionar grouping por modelo no resumo existente

## Impact

- **Backend (NestJS)**: Nova entidade ModelPrice, AgentModelConfig, services, endpoints admin
- **Agentes (FastAPI)**: Modificar DTOs para aceitar campo `model`, usar modelo da requisição
- **Frontend (React)**: Novas páginas admin para gestão de modelos e configurações
- **Frontend (React)**: Adicionar cards "Usage by Model" na página TokenUsagePage
- **Infra**: Apenas GOOGLE_API_KEY permanece no ENV