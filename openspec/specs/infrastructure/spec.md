# Infrastructure Specification

## Purpose
Gerenciamento de infraestrutura externa (MySQL, Redis) e requisitos operacionais da plataforma.

## Scope
O que está **incluído** nessa spec:
- Configuração de serviços externos via variáveis de ambiente
- Ordem de inicialização dos serviços
- Migrations de banco de dados
- Persistência de filas assíncronas

O que está **fora do escopo**:
- Provisionamento de infraestrutura em cloud
- Backup e recuperação de dados

## Requirements

### Requirement: External Service Configuration
The system SHALL connect to MySQL and Redis services using connection URLs provided via environment variables.

#### Scenario: App starts with external URLs
- **GIVEN** a valid `DATABASE_URL` for a MySQL instance
- **AND** a valid `REDIS_URL` for a Redis instance
- **WHEN** the application starts
- **THEN** it connects successfully to both infrastructure services

### Requirement: Database Schema Migrations
The system MUST manage database schema changes through versioned migrations, not auto-synchronization.

#### Scenario: Migrations executadas na inicialização (produção)
- GIVEN um banco de dados com schema desatualizado
- WHEN a aplicação é iniciada em modo produção
- THEN as migrations pendentes são executadas automaticamente antes de aceitar requisições
- AND o schema é atualizado sem perda de dados existentes

#### Scenario: Schema já atualizado
- GIVEN um banco de dados com todas as migrations aplicadas
- WHEN a aplicação é iniciada
- THEN nenhuma migration é executada
- AND a aplicação inicia normalmente

### Requirement: Service Startup Order
The system SHALL guarantee that dependent services are healthy before accepting traffic.

#### Scenario: API aguarda Agents Service
- GIVEN o Agents Service ainda em processo de inicialização
- WHEN a API tenta iniciar
- THEN a API aguarda o Agents Service responder com sucesso no endpoint `/health`
- AND somente então começa a processar requisições

### Requirement: Async Job Queue Persistence
The system MUST use Redis as the persistence layer for all asynchronous job queues, with automatic retry on failure.

#### Scenario: Job com falha reprocessado automaticamente
- GIVEN um job de geração (path, conteúdo ou análise) que falhou
- WHEN o número de tentativas ainda não atingiu o limite (3 tentativas)
- THEN o sistema reenfileira o job com backoff exponencial
- AND tenta novamente até esgotar as tentativas ou ter sucesso

#### Scenario: Job esgota tentativas
- GIVEN um job que falhou 3 vezes consecutivas
- THEN o sistema marca o AgentJob correspondente como FAILED
- AND registra a mensagem de erro para diagnóstico
- AND o recurso associado (StudyPath, Content ou Submission) é atualizado para refletir o erro
