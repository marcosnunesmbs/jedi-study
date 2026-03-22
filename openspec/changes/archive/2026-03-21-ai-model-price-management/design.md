## Context

O sistema atual usa variáveis de ambiente para configurar modelos de IA:
- `GEMINI_MODEL` para agentes principais
- `GEMINI_MODEL_SAFETY` para verificação de segurança
- Preços hardcoded em `config.py` dos agentes

Os registros de `TokenUsage` já armazenam o nome do modelo usado, mas não há gestão centralizada de modelos nem visualização de custos por modelo.

## Goals / Non-Goals

**Goals:**
- Permitir cadastro e gestão de modelos de IA via painel admin (sem necessidade de ENV/redeploy)
- Configurar qual modelo cada tipo de agente utiliza
- Visualizar custos de tokens agrupados por modelo
- Manter apenas a API key do Google no ENV

**Non-Goals:**
- Autenticação de agentes (agentes não precisam se autenticar com o backend)
- Suporte a múltiplos provedores (apenas Google Gemini por agora)
- Recalcular custos de registros históricos ao mudar preços

## Decisions

### D1: Modelo passado na requisição vs agente busca configuração

**Decisão**: Backend passa o modelo na requisição ao agente

**Alternativas consideradas**:
- Agente chama API para buscar configuração → Requereria autenticação do agente
- Agente lê de cache local → Requereria mecanismo de sync

**Rationale**: O backend já sabe qual modelo está configurado para cada tipo de agente. Passar na requisição é mais simples e não requer autenticação.

### D2: Custo calculado no agente vs no backend

**Decisão**: Custo calculado no agente (manter comportamento atual)

**Rationale**: O agente tem acesso aos metadados de uso (tokens) e aos preços do modelo. O backend apenas registra o resultado.

### D3: Estrutura de tabelas

**Decisão**: Duas tabelas - `ModelPrice` (catálogo) e `AgentModelConfig` (mapeamento)

**Rationale**: Permite reutilizar o mesmo modelo em múltiplos agentes e facilita mudanças futuras.

### D4: Fallback para modelos não cadastrados

**Decisão**: Sistema não funciona se modelo não estiver cadastrado

**Rationale**: Se o modelo não está cadastrado, não temos os preços. O sistema deve falhar explicitamente.

## Risks / Trade-offs

- **[Risco]** Mudança de modelo pode quebrarexecuções em andamento
  - **Mitigação**: Apenas novas execuções usam o novo modelo

- **[Risco]** Necessário migrar modelos existentes para o banco
  - **Mitigação**: Criar seed com os modelos atuais (gemini-1.5-pro, gemini-2.5-flash-lite)

- **[Risco]** Agentes precisam ser atualizados para ler modelo da requisição
  - **Mitigação**: Campo opcional com fallback para ENV durante transição

## Migration Plan

1. Criar migração com tabelas `ModelPrice` e `AgentModelConfig`
2. Seed dos modelos atuais (gemini-1.5-pro, gemini-2.5-flash-lite)
3. Seed das configurações de agente (cada agente com seu modelo padrão)
4. Atualizar backend para injetar modelo nas chamadas
5. Atualizar agentes para usar modelo da requisição
6. Atualizar frontend com páginas admin
7. Remover variáveis de ambiente obsoletas (GEMINI_MODEL, GEMINI_MODEL_SAFETY, etc)

## Open Questions

- Quantas casas decimais usar para preços? (hoje usa 8 no agente)
- Precisamos de versionamento de preços? (não para MVP)