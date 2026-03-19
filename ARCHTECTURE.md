# Arquitetura — Jedi Study

> Plataforma de aprendizado orientada por estado com múltiplos agentes de IA.
> Fluxo principal: **Subject → StudyPath → Phase → Task → Submission → Analysis**

---

## Índice

### Diagramas Estruturais
1. [Contexto do Sistema (C4 Level 1)](#1-contexto-do-sistema)
2. [Containers (C4 Level 2)](#2-containers)
3. [Componentes da API NestJS (C4 Level 3)](#3-componentes-da-api-nestjs)
4. [Componentes do Agents Service](#4-componentes-do-agents-service)
5. [Arquitetura do Frontend React](#5-arquitetura-do-frontend-react)
6. [Modelo de Entidades (ER)](#6-modelo-de-entidades)

### Diagramas Comportamentais
7. [Autenticação](#7-autenticação)
8. [Geração de StudyPath (Async)](#8-geração-de-studypath)
9. [Submissão de Task + Unlock de Fases](#9-submissão-de-task-e-unlock-de-fases)
10. [Geração de Conteúdo + SSE](#10-geração-de-conteúdo-e-sse)
11. [Máquina de Estados — StudyPath](#11-máquina-de-estados--studypath)
12. [Máquina de Estados — Phase](#12-máquina-de-estados--phase)
13. [Máquina de Estados — Task e Submission](#13-máquina-de-estados--task-e-submission)
14. [Máquina de Estados — AgentJob e Content](#14-máquina-de-estados--agentjob-e-content)
15. [Arquitetura de Filas BullMQ](#15-arquitetura-de-filas-bullmq)

---

## Diagramas Estruturais

---

### 1. Contexto do Sistema

> **O que é:** Visão de mais alto nível. Mostra o sistema como uma caixa preta e quem interage com ele — usuários e sistemas externos.

```mermaid
graph TB
    User["👤 Usuário\n(Estudante / Admin)"]

    subgraph Sistema["🎓 Jedi Study"]
        Platform["Plataforma de Aprendizado\ncom Agentes de IA"]
    end

    Gemini["☁️ Google Gemini API\n(LLM externo)"]
    MySQL["🗄️ MySQL\n(Banco de dados externo)"]
    Redis["⚡ Redis\n(Fila de jobs externo)"]

    User -->|"Acessa via browser\n(HTTPS)"| Platform
    Platform -->|"Gera planos, conteúdos\ne análises via LLM"| Gemini
    Platform -->|"Persiste todos os dados"| MySQL
    Platform -->|"Enfileira e processa\njobs assíncronos"| Redis
```

**Explicação:**
O usuário interage exclusivamente com a plataforma via browser. Toda a inteligência artificial é delegada ao **Google Gemini** via API. O **MySQL** persiste o estado de todos os recursos (subjects, paths, tasks, etc.). O **Redis** é o backbone de processamento assíncrono via BullMQ — sem ele, nenhuma geração de conteúdo ou análise acontece.

---

### 2. Containers

> **O que é:** Desmembra o sistema em processos executáveis independentes (containers). Mostra como se comunicam entre si e com os sistemas externos.

```mermaid
graph TB
    User["👤 Usuário"]

    subgraph Infra["Infraestrutura Jedi Study"]
        Web["🌐 Web App\nReact + Vite\n(PWA)\n:5173"]
        API["⚙️ API\nNestJS + TypeORM\n:3000"]
        Agents["🤖 Agents Service\nFastAPI + Python\n:8000"]
    end

    MySQL[("🗄️ MySQL\n:3306")]
    Redis[("⚡ Redis\n:6379")]
    Gemini["☁️ Google Gemini API"]

    User -->|"HTTP / SSE"| Web
    Web -->|"REST JSON\n/api/*"| API
    API -->|"REST JSON\n/agents/*"| Agents
    API -->|"TypeORM\nSQL"| MySQL
    API -->|"BullMQ\njobs"| Redis
    API -->|"BullMQ\nworkers"| Redis
    Agents -->|"google-genai SDK\nHTTPS"| Gemini

    style Web fill:#4A90D9,color:#fff
    style API fill:#7B68EE,color:#fff
    style Agents fill:#2ECC71,color:#fff
    style MySQL fill:#E67E22,color:#fff
    style Redis fill:#E74C3C,color:#fff
    style Gemini fill:#3498DB,color:#fff
```

**Explicação:**
- **Web App** — PWA em React/Vite. Comunica com a API via REST. Usa Axios com interceptors para injetar JWT e unwrap respostas. Tem um endpoint SSE para streaming de conteúdo gerado.
- **API NestJS** — Coração do sistema. Gerencia autenticação, orquestra os jobs assíncronos via BullMQ, e faz a ponte entre Web e Agents. Nunca chama o Gemini diretamente.
- **Agents Service** — Serviço Python isolado. Única responsabilidade: chamar o Gemini com prompts estruturados e retornar dados validados (Pydantic). Sem banco de dados próprio.
- **MySQL** — Banco único compartilhado. Gerenciado por TypeORM com migrations. Persiste todo o estado da plataforma.
- **Redis** — Armazena as filas BullMQ. Cada tipo de job tem sua fila dedicada. A API produz os jobs; os processors da própria API os consomem.

---

### 3. Componentes da API NestJS

> **O que é:** Internamente, a API é organizada em módulos NestJS independentes. Este diagrama mostra cada módulo, suas responsabilidades e dependências.

```mermaid
graph TB
    subgraph Core["AppModule (Core)"]
        JwtGuard["🔐 JwtAuthGuard\n(global)"]
        Transform["📦 TransformInterceptor\n(global)"]
        ExFilter["🚨 HttpExceptionFilter\n(global)"]
        InitSvc["🌱 InitializationService\n(seed admin)"]
    end

    subgraph Auth["AuthModule"]
        AuthCtrl["POST /auth/register\nPOST /auth/login\nGET /auth/me"]
        AuthSvc["AuthService\nbcrypt + JWT"]
    end

    subgraph Users["UsersModule"]
        UsersCtrl["PATCH /users/profile\nPATCH /users/password"]
        UsersSvc["UsersService\nfindById / findByEmail"]
    end

    subgraph Subjects["SubjectsModule"]
        SubjCtrl["GET|POST|DELETE /subjects"]
        SubjSvc["SubjectsService\nfindAll / findOne / create"]
    end

    subgraph StudyPaths["StudyPathsModule"]
        SPCtrl["POST /generate\nGET /active\nGET /:id\nGET /:id/status"]
        SPSvc["StudyPathsService\narchive + create + enqueue"]
        SPQueue["Queue: path-generation\nattempts=3, timeout=120s"]
    end

    subgraph Phases["PhasesModule"]
        PhCtrl["GET /phases/:id"]
        PhSvc["PhasesService\nfindOne / tryUnlockNext"]
    end

    subgraph Tasks["TasksModule"]
        TkCtrl["GET /tasks/:id\nPOST /tasks/:id/submit\nGET /submissions/:id/*"]
        TkSvc["TasksService\nsubmit + getAnalysis"]
        TkQueue["Queue: task-analysis\nattempts=3, timeout=90s"]
    end

    subgraph Content["ContentModule"]
        CtCtrl["POST /phases/:id/content/generate\nGET /content/:id\nGET /content/:id/stream (SSE)"]
        CtSvc["ContentService\ngenerateForPhase"]
        CtQueue["Queue: content-generation\nattempts=3, timeout=60s"]
    end

    subgraph Queues["QueuesModule (Processors)"]
        PathProc["PathGenerationProcessor\n@Process('generate')"]
        TaskProc["TaskAnalysisProcessor\n@Process('analyze')"]
        ContProc["ContentProcessor\n@Process('generate')"]
    end

    subgraph AgentsModule["AgentsModule"]
        AgentsSvc["AgentsService\nHTTP client → :8000"]
    end

    subgraph TokenUsage["TokenUsageModule"]
        TUCtrl["GET /admin/token-usage\nGET /admin/token-usage/summary"]
        TUSvc["TokenUsageService\nrecord + getSummary"]
    end

    subgraph DB["DatabaseModule (TypeORM)"]
        Entities["10 Entities\nUser, Subject, StudyPath\nPhase, Task, Submission\nAnalysis, Content\nAgentJob, TokenUsage"]
    end

    SPQueue --> PathProc
    TkQueue --> TaskProc
    CtQueue --> ContProc

    PathProc --> AgentsSvc
    TaskProc --> AgentsSvc
    ContProc --> AgentsSvc

    PathProc --> TUSvc
    TaskProc --> TUSvc
    ContProc --> TUSvc

    PathProc --> PhSvc

    Core --> DB
    Auth --> DB
    Users --> DB
    Subjects --> DB
    StudyPaths --> DB
    Phases --> DB
    Tasks --> DB
    Content --> DB
    Queues --> DB
```

**Explicação:**
- O `JwtAuthGuard` protege todas as rotas globalmente. Rotas públicas usam o decorator `@Public()`.
- O `TransformInterceptor` encapsula todas as respostas em `{success: true, data: ...}`.
- Os **Processors** (QueuesModule) são os únicos consumidores das filas — eles chamam o `AgentsService` e registram o `TokenUsage` após cada chamada ao Gemini.
- O `PathGenerationProcessor` depende do `PhasesService` para executar a lógica de unlock após a geração do path.
- O `DatabaseModule` exporta o TypeORM para todos os outros módulos via `autoLoadEntities`.

---

### 4. Componentes do Agents Service

> **O que é:** Internamente, o Agents Service é um conjunto de 4 agentes independentes, cada um com seu router FastAPI, lógica de prompt e schema de saída.

```mermaid
graph TB
    subgraph FastAPI["FastAPI App (:8000)"]
        Health["GET /health"]
        CORS["CORSMiddleware"]

        subgraph PathGen["path-generator"]
            PGRouter["POST /agents/path-generator"]
            PGAgent["generate_study_path()\ntemp=0.8"]
            PGSchema["StudyPathOutput\nPydantic Schema"]
            PGPrompt["SYSTEM_PROMPT\nLearning Architect"]
        end

        subgraph ContentGen["content-gen"]
            CGRouter["POST /agents/content-gen"]
            CGAgent["generate_content()\ntemp=0.7"]
            CGPrompt["SYSTEM_PROMPT\nEducational Creator"]
        end

        subgraph TaskAnalyzer["task-analyzer"]
            TARouter["POST /agents/task-analyzer"]
            TAAgent["analyze_task()\ntemp=0.3"]
            TASchema["TaskAnalysisOutput\nPydantic Schema"]
            TAPrompt["SYSTEM_PROMPT\nLearning Coach"]
        end

        subgraph ProjectAnalyzer["project-analyzer"]
            PARouter["POST /agents/project-analyzer"]
            PAAgent["analyze_project()\ntemp=0.3"]
            PASchema["ProjectAnalysisOutput\nPydantic Schema"]
            PAPrompt["SYSTEM_PROMPT\nSenior Engineer"]
        end

        subgraph Base["agents/base.py"]
            GetClient["get_client()\ngenai.Client"]
            BuildUsage["build_usage()\nTokenUsageInfo"]
            CalcCost["calculate_cost()\nUSD estimation"]
        end
    end

    Gemini["☁️ Google Gemini API\nclient.aio.models.generate_content()"]

    PGRouter --> PGAgent
    CGRouter --> CGAgent
    TARouter --> TAAgent
    PARouter --> PAAgent

    PGAgent --> PGSchema
    TAAgent --> TASchema
    PAAgent --> PASchema

    PGAgent --> Base
    CGAgent --> Base
    TAAgent --> Base
    PAAgent --> Base

    Base -->|"response_json_schema\napplication/json"| Gemini

    style Gemini fill:#3498DB,color:#fff
```

**Explicação:**
- Cada agente usa `client.aio.models.generate_content()` (async nativo via `client.aio`).
- **PathGenerator** e os analyzers usam `response_json_schema: Model.model_json_schema()` — o Gemini retorna JSON garantido conformando ao schema Pydantic, sem necessidade de parsing manual.
- **ContentGen** é o único que retorna texto livre (Markdown) — sem `response_json_schema`.
- A `temperature` é calibrada por agente: criação (0.7–0.8) vs análise (0.3) para respostas mais determinísticas.
- `build_usage()` extrai `usage_metadata` da resposta para calcular custo em USD e registrar no API.

---

### 5. Arquitetura do Frontend React

> **O que é:** Organização interna do Web App — roteamento, gerenciamento de estado e camada de API.

```mermaid
graph TB
    subgraph Entry["Entry Point"]
        Main["main.tsx\nQueryClient + BrowserRouter"]
    end

    subgraph Router["React Router"]
        App["App.tsx"]
        Public["Rotas Públicas\n/login"]
        Private["PrivateRoute\n(requer token)"]
        Admin["AdminRoute\n(requer ADMIN)"]

        subgraph Pages["Pages"]
            Dashboard["DashboardPage\n/"]
            Subject["SubjectPage\n/subjects/:id"]
            Phase["PhasePage\n/phases/:id"]
            Task["TaskPage\n/tasks/:id"]
            ContentPage["ContentPage\n/content/:id"]
            Profile["ProfilePage\n/profile"]
            Tokens["TokenUsagePage\n/tokens"]
        end
    end

    subgraph State["State Management"]
        AuthStore["authStore (Zustand)\n+ persist\ntoken, user\nsetAuth / logout"]
        SPStore["studyPathStore (Zustand)\ncurrentStudyPathId\ncurrentPhaseId"]
        RQ["React Query\nserver state cache\nstaleTime=5min, retry=1"]
    end

    subgraph APILayer["API Layer (Axios)"]
        Client["client.ts\nbaseURL: VITE_API_URL\n→ Bearer token inject\n→ data.data unwrap\n→ 401 → logout"]
        AuthAPI["auth.api.ts"]
        SubjAPI["subjects.api.ts"]
        SPAPI["study-paths.api.ts"]
        PhAPI["phases.api.ts"]
        TkAPI["tasks.api.ts"]
        CtAPI["content.api.ts\n+ streamUrl() SSE"]
        TUAPI["token-usage.api.ts"]
        UsersAPI["users.api.ts"]
    end

    Main --> App
    App --> Public
    App --> Private
    App --> Admin

    Private --> Pages
    Admin --> Tokens

    Pages -->|"useQuery / useMutation"| RQ
    RQ --> APILayer
    Pages -->|"reads/writes"| AuthStore
    Pages -->|"reads/writes"| SPStore
    Client --> AuthStore

    style AuthStore fill:#E74C3C,color:#fff
    style SPStore fill:#E67E22,color:#fff
    style RQ fill:#3498DB,color:#fff
```

**Explicação:**
- **Zustand** gerencia apenas estado local persistente (auth token) e navegação (qual path/fase está ativa). É síncrono e sem cache.
- **React Query** gerencia todo o estado servidor — fetching, caching, invalidação. Rotas como `GET /tasks/:id` são cacheadas por 5 minutos.
- O `client.ts` tem dois interceptors: (1) injeta `Authorization: Bearer <token>` em toda requisição; (2) unwrapa `response.data.data` automaticamente (removendo o envelope `{success, data}` do `TransformInterceptor`).
- O `content.api.ts` tem um `streamUrl()` que retorna a URL do endpoint SSE com o token como query param (necessário pois `EventSource` não suporta headers customizados).

---

### 6. Modelo de Entidades

> **O que é:** Relacionamentos entre todas as entidades do banco MySQL. Mostra cardinalidade, campos principais e chaves.

```mermaid
erDiagram
    User {
        uuid id PK
        string email UK
        string passwordHash
        string displayName
        enum role "USER|ADMIN"
        datetime createdAt
        datetime updatedAt
    }

    Subject {
        uuid id PK
        uuid userId FK
        string title
        string description
        enum skillLevel "BEGINNER|INTERMEDIATE|ADVANCED"
        text goals "JSON array"
        datetime createdAt
        datetime updatedAt
    }

    StudyPath {
        uuid id PK
        uuid subjectId FK
        uuid userId FK
        int version
        boolean isActive
        enum status "GENERATING|ACTIVE|ARCHIVED"
        text rawAgentOutput "JSON"
        int estimatedHours
        int totalPhases
        datetime createdAt
        datetime updatedAt
    }

    Phase {
        uuid id PK
        uuid studyPathId FK
        int order "UNIQUE with studyPathId"
        string title
        text description
        text objectives "JSON array"
        text topics "JSON array"
        enum status "LOCKED|ACTIVE|COMPLETED"
        int estimatedHours
        datetime createdAt
        datetime updatedAt
    }

    Task {
        uuid id PK
        uuid phaseId FK
        int order "UNIQUE with phaseId"
        string title
        text description
        enum type "READING|EXERCISE|PROJECT|QUIZ"
        enum status "PENDING|SUBMITTED|PASSED|FAILED"
        text projectContext "JSON nullable"
        int maxScore
        datetime createdAt
        datetime updatedAt
    }

    Submission {
        uuid id PK
        uuid taskId FK
        int attempt
        text content
        enum contentType "TEXT|CODE|MARKDOWN"
        enum status "PENDING|ANALYZING|COMPLETE|ERROR"
        int score
        boolean passed
        datetime createdAt
    }

    Analysis {
        uuid id PK
        uuid submissionId FK "UNIQUE"
        string agentType
        text feedback
        text strengths "JSON array"
        text improvements "JSON array"
        int score
        boolean passed
        text rawOutput "JSON"
        datetime createdAt
    }

    Content {
        uuid id PK
        uuid phaseId FK
        string topic
        enum type "EXPLANATION|EXAMPLE|SUMMARY|RESOURCE_LIST|CUSTOM"
        string title
        text body
        enum status "PENDING|STREAMING|COMPLETE|ERROR"
        string jobId
        datetime createdAt
        datetime updatedAt
    }

    AgentJob {
        uuid id PK
        string bullJobId UK
        enum type "PATH_GENERATOR|CONTENT_GEN|TASK_ANALYZER|PROJECT_ANALYZER"
        enum status "QUEUED|PROCESSING|COMPLETE|FAILED"
        uuid referenceId "studyPathId|contentId|submissionId"
        text error
        datetime startedAt
        datetime completedAt
        datetime createdAt
    }

    TokenUsage {
        uuid id PK
        uuid userId FK
        enum agentType
        uuid referenceId
        string referenceType
        string model
        int inputTokens
        int outputTokens
        int totalTokens
        float estimatedCostUsd
        int durationMs
        datetime createdAt
    }

    User ||--o{ Subject : "owns"
    User ||--o{ StudyPath : "has"
    User ||--o{ TokenUsage : "accrues"

    Subject ||--o{ StudyPath : "generates"

    StudyPath ||--o{ Phase : "contains"

    Phase ||--o{ Task : "contains"
    Phase ||--o{ Content : "has"

    Task ||--o{ Submission : "receives"

    Submission ||--o| Analysis : "produces"
```

**Explicação:**
- `Subject` é o ponto de entrada do usuário. Um Subject pode ter múltiplos `StudyPath` (versionados), mas apenas um `isActive=true` por vez.
- `Phase.order` tem constraint UNIQUE com `studyPathId` — garante sequência sem gaps.
- `Task.order` tem constraint UNIQUE com `phaseId` — idem para tasks dentro de uma fase.
- `AgentJob.referenceId` é um campo polimórfico (pode apontar para `StudyPath`, `Content` ou `Submission`). Não há FK constraint — é resolvido no código pelo campo `type`.
- `Analysis` tem relação `OneToOne` com `Submission` — uma submission gera exatamente uma analysis.
- `TokenUsage` registra cada chamada ao Gemini com custo calculado, vinculado ao usuário que originou a ação.

---

## Diagramas Comportamentais

---

### 7. Autenticação

> **O que é:** Fluxo completo de registro, login e proteção de rotas via JWT.

```mermaid
sequenceDiagram
    actor User as 👤 Usuário
    participant Web as 🌐 Web App
    participant API as ⚙️ API NestJS
    participant DB as 🗄️ MySQL

    %% Registro
    Note over User, DB: Fluxo de Registro
    User->>Web: Preenche form (email, senha, nome)
    Web->>API: POST /auth/register
    API->>DB: SELECT user WHERE email = ?
    DB-->>API: null (email disponível)
    API->>API: bcrypt.hash(password, 10)
    API->>DB: INSERT user (email, passwordHash, displayName, role=USER)
    DB-->>API: User criado
    API->>API: jwt.sign({sub, email, role}, JWT_SECRET)
    API-->>Web: {token, user}
    Web->>Web: authStore.setAuth(token, user)
    Web->>User: Redireciona para /

    %% Login
    Note over User, DB: Fluxo de Login
    User->>Web: Preenche form (email, senha)
    Web->>API: POST /auth/login
    API->>DB: SELECT user WHERE email = ?
    DB-->>API: User encontrado
    API->>API: bcrypt.compare(password, passwordHash)
    alt Senha correta
        API->>API: jwt.sign({sub, email, role})
        API-->>Web: {token, user}
        Web->>Web: authStore.setAuth(token, user)
        Web->>User: Redireciona para /
    else Senha incorreta
        API-->>Web: 401 Unauthorized
        Web->>User: Exibe erro
    end

    %% Requisição autenticada
    Note over User, DB: Requisição protegida
    User->>Web: Acessa rota protegida
    Web->>API: GET /subjects\nAuthorization: Bearer <token>
    API->>API: JwtAuthGuard.canActivate()\njwt.verify(token, JWT_SECRET)
    alt Token válido
        API->>DB: SELECT subjects WHERE userId = ?
        DB-->>API: Subjects
        API-->>Web: {success: true, data: [...]}
        Web->>User: Exibe dados
    else Token inválido/expirado
        API-->>Web: 401 Unauthorized
        Web->>Web: authStore.logout()\nredireciona /login
    end
```

**Explicação:**
- O `JwtAuthGuard` é global — toda rota é protegida por padrão. Apenas `POST /auth/register` e `POST /auth/login` têm `@Public()`.
- O JWT carrega `{sub: userId, email, role}` e expira conforme `JWT_EXPIRES_IN` (default 24h).
- O Axios interceptor no Web App cuida automaticamente do 401 → logout → redirect.

---

### 8. Geração de StudyPath

> **O que é:** Fluxo assíncrono completo — desde o clique do usuário até as fases/tasks criadas no banco, passando pela fila BullMQ e o Agents Service.

```mermaid
sequenceDiagram
    actor User as 👤 Usuário
    participant Web as 🌐 Web App
    participant API as ⚙️ API NestJS
    participant Redis as ⚡ Redis (BullMQ)
    participant Proc as 🔄 PathGenProcessor
    participant Agents as 🤖 Agents Service
    participant Gemini as ☁️ Gemini API
    participant DB as 🗄️ MySQL

    User->>Web: Clica "Gerar Plano de Estudos"
    Web->>API: POST /subjects/:id/study-paths/generate

    API->>DB: UPDATE studyPath SET isActive=false, status=ARCHIVED\n(arquiva path ativo anterior)
    API->>DB: INSERT studyPath (status=GENERATING, isActive=true, version++)
    API->>Redis: Queue.add('generate', {studyPathId, subjectTitle, skillLevel, goals})
    API->>DB: INSERT agentJob (type=PATH_GENERATOR, status=QUEUED, referenceId=studyPathId)
    API-->>Web: {studyPathId, jobId}

    Web->>Web: Inicia polling GET /study-paths/:id/status

    Note over Redis, Proc: Job processado pela fila
    Redis->>Proc: Job dequeued
    Proc->>DB: UPDATE agentJob SET status=PROCESSING, startedAt=NOW()

    Proc->>Agents: POST /agents/path-generator\n{subjectTitle, skillLevel, goals}
    Agents->>Agents: build_prompt() + model_json_schema()
    Agents->>Gemini: client.aio.models.generate_content\n(response_json_schema=StudyPathOutput)
    Gemini-->>Agents: JSON conforme schema
    Agents->>Agents: StudyPathOutput.model_validate_json(response.text)
    Agents-->>Proc: AgentResponse{data: StudyPathOutput, usage: TokenUsageInfo}

    Proc->>DB: INSERT tokenUsage (inputTokens, outputTokens, estimatedCostUsd)

    Proc->>Proc: Validate com Zod StudyPathOutputSchema

    Note over Proc, DB: Transação atômica
    Proc->>DB: INSERT phase (order=1, status=ACTIVE)
    Proc->>DB: INSERT phase (order=2..N, status=LOCKED)
    Proc->>DB: INSERT tasks para cada phase
    Proc->>DB: UPDATE studyPath SET status=ACTIVE, totalPhases, estimatedHours

    Proc->>DB: UPDATE agentJob SET status=COMPLETE, completedAt=NOW()

    Web->>API: GET /study-paths/:id/status
    API-->>Web: {status: "ACTIVE", agentJob: {status: "COMPLETE"}}
    Web->>User: Exibe plano de estudos gerado ✅

    Note over Proc, DB: Em caso de erro
    Proc--xDB: UPDATE studyPath SET status=ARCHIVED
    Proc--xDB: UPDATE agentJob SET status=FAILED, error="..."
```

**Explicação:**
- A API retorna imediatamente com `{studyPathId}` — a geração é **100% assíncrona**.
- O Web App faz polling no endpoint de status. Quando `studyPath.status === 'ACTIVE'`, exibe o plano.
- A fase de ordem 1 nasce `ACTIVE` (desbloqueada). Todas as demais nascem `LOCKED` — o usuário deve completar sequencialmente.
- A criação de phases e tasks é feita em **transação atômica** — ou tudo é criado, ou nada.
- BullMQ tenta o job **3 vezes** com backoff exponencial antes de marcar como FAILED.

---

### 9. Submissão de Task e Unlock de Fases

> **O que é:** Fluxo de submissão de uma resposta + análise pelo agente + lógica de desbloqueio sequencial de fases.

```mermaid
sequenceDiagram
    actor User as 👤 Usuário
    participant Web as 🌐 Web App
    participant API as ⚙️ API NestJS
    participant Redis as ⚡ Redis (BullMQ)
    participant Proc as 🔄 TaskAnalysisProcessor
    participant Agents as 🤖 Agents Service
    participant Gemini as ☁️ Gemini API
    participant DB as 🗄️ MySQL

    User->>Web: Envia resposta da task
    Web->>API: POST /tasks/:id/submit\n{content, contentType}

    API->>DB: SELECT submissions WHERE taskId ORDER BY attempt DESC
    API->>DB: INSERT submission (attempt=N+1, status=PENDING)
    API->>DB: UPDATE task SET status=SUBMITTED
    API->>Redis: Queue.add('analyze', {submissionId, taskType, taskTitle, submissionContent, projectContext?})
    API->>DB: INSERT agentJob (type=TASK_ANALYZER|PROJECT_ANALYZER, status=QUEUED)
    API-->>Web: {submissionId, jobId}

    Web->>Web: Inicia polling GET /submissions/:id/status

    Redis->>Proc: Job dequeued
    Proc->>DB: UPDATE submission SET status=ANALYZING

    alt Task do tipo PROJECT
        Proc->>Agents: POST /agents/project-analyzer\n{taskTitle, description, submission, projectContext}
    else Outros tipos (READING, EXERCISE, QUIZ)
        Proc->>Agents: POST /agents/task-analyzer\n{taskTitle, description, submission}
    end

    Agents->>Gemini: generate_content\n(response_json_schema=TaskAnalysisOutput|ProjectAnalysisOutput\ntemp=0.3)
    Gemini-->>Agents: JSON análise
    Agents-->>Proc: AgentResponse{feedback, strengths, improvements, score, passed}

    Proc->>DB: INSERT tokenUsage
    Proc->>DB: INSERT analysis (feedback, strengths, improvements, score, passed)
    Proc->>DB: UPDATE submission SET status=COMPLETE, score, passed
    Proc->>DB: UPDATE task SET status=PASSED|FAILED

    alt Task PASSOU (score >= 70)
        Proc->>DB: SELECT tasks WHERE phaseId AND status != PASSED
        alt Todas as tasks da fase passaram
            Proc->>DB: UPDATE phase SET status=COMPLETED
            Note over Proc, DB: Lógica de unlock da próxima fase
            Proc->>DB: SELECT phase WHERE studyPathId AND order = currentPhaseOrder + 1
            alt Próxima fase existe
                Proc->>DB: UPDATE nextPhase SET status=ACTIVE
            else Não há próxima fase (última fase)
                Proc->>DB: UPDATE studyPath SET status=ARCHIVED
            end
        end
    end

    Proc->>DB: UPDATE agentJob SET status=COMPLETE

    Web->>API: GET /submissions/:id/status
    API-->>Web: {status: COMPLETE, score: 85, passed: true}
    Web->>User: Exibe resultado e feedback ✅
    Web->>User: [se fase desbloqueada] Exibe próxima fase disponível
```

**Explicação:**
- Tasks do tipo `PROJECT` são roteadas para o `project-analyzer` (temperatura 0.3, schema diferente com `technicalAssessment` e `architectureNotes`).
- O threshold de aprovação é **70/100** — definido no system prompt dos analyzers.
- O desbloqueio é **automático e em cascata** dentro do processor — nenhuma ação manual do usuário é necessária.
- A última fase concluída muda o `StudyPath.status` para `ARCHIVED` (ciclo completo de aprendizado).
- A `attempt` em `Submission` permite múltiplas tentativas na mesma task — cada nova submissão cria um novo registro.

---

### 10. Geração de Conteúdo e SSE

> **O que é:** Fluxo de geração de conteúdo educacional com streaming de status via Server-Sent Events (SSE).

```mermaid
sequenceDiagram
    actor User as 👤 Usuário
    participant Web as 🌐 Web App
    participant API as ⚙️ API NestJS
    participant Redis as ⚡ Redis (BullMQ)
    participant Proc as 🔄 ContentProcessor
    participant Agents as 🤖 Agents Service
    participant Gemini as ☁️ Gemini API
    participant DB as 🗄️ MySQL

    User->>Web: Clica "Gerar Conteúdo"\n(seleciona tipo: EXPLANATION, EXAMPLE, etc.)
    Web->>API: POST /phases/:id/content/generate\n{contentType, topic?, customPrompt?}

    API->>DB: INSERT content (status=PENDING, type, topic)
    API->>Redis: Queue.add('generate', {contentId, phaseTitle, phaseObjectives, contentType})
    API->>DB: INSERT agentJob (type=CONTENT_GEN, status=QUEUED, referenceId=contentId)
    API-->>Web: {contentId, jobId}

    Note over Web, API: Web abre conexão SSE (EventSource não suporta headers)
    Web->>API: GET /content/:id/stream?token=<jwt>
    API->>API: Verifica JWT via query param
    API-->>Web: SSE stream aberto (text/event-stream)

    Note over Redis, Proc: Processamento em paralelo ao SSE
    Redis->>Proc: Job dequeued
    Proc->>DB: UPDATE content SET status=STREAMING
    Proc->>API: SSE send: {status: "STREAMING"}

    Proc->>Agents: POST /agents/content-gen\n{phaseTitle, phaseObjectives, contentType, topic?}
    Agents->>Gemini: generate_content\n(system_instruction, temp=0.7)\n(sem response_json_schema — retorna Markdown)
    Gemini-->>Agents: Texto Markdown
    Agents-->>Proc: AgentResponse{data: "# Título\n\n...markdown..."}

    Proc->>DB: INSERT tokenUsage
    Proc->>DB: UPDATE content SET body=markdownText, status=COMPLETE
    Proc->>DB: UPDATE agentJob SET status=COMPLETE

    Note over Web, API: SSE polling detecta COMPLETE (poll a cada 1500ms)
    API->>DB: SELECT content WHERE id
    DB-->>API: content.status = COMPLETE
    API-->>Web: SSE event: {status: "COMPLETE", body: "# Título\n..."}
    API-->>Web: SSE stream fechado

    Web->>User: Renderiza conteúdo Markdown ✅
```

**Explicação:**
- O `EventSource` (API padrão de SSE do browser) não permite headers customizados, então o JWT é enviado como query param `?token=<jwt>` — o endpoint de stream valida dessa forma.
- O SSE faz **polling no banco a cada 1.500ms** — não é streaming real de tokens. O conteúdo completo é enviado num único evento quando o status vira `COMPLETE`.
- O `ContentGen` é o único agente que **não usa `response_json_schema`** — retorna Markdown livre, temperatura mais alta para conteúdo mais criativo.
- Tipos de conteúdo: `EXPLANATION` (conceitual), `EXAMPLE` (exemplos práticos), `SUMMARY` (revisão), `RESOURCE_LIST` (curadoria de links), `CUSTOM` (via `customPrompt`).

---

### 11. Máquina de Estados — StudyPath

> **O que é:** Todos os estados possíveis de um StudyPath e as transições entre eles.

```mermaid
stateDiagram-v2
    [*] --> GENERATING : POST /generate\n(API cria registro)

    GENERATING --> ACTIVE : PathGenProcessor\ncria phases + tasks\ncom sucesso

    GENERATING --> ARCHIVED : PathGenProcessor\nerro irrecuperável\n(3 tentativas esgotadas)

    ACTIVE --> ARCHIVED : Última phase\nconcluída\n(TaskAnalysisProcessor)

    ACTIVE --> GENERATING : POST /generate novamente\n(nova versão - versão anterior\nvira isActive=false + ARCHIVED)

    note right of GENERATING
        isActive = true
        version = N
        Fases ainda não existem
    end note

    note right of ACTIVE
        isActive = true
        Fases e tasks já criadas
        Phase 1 = ACTIVE
        Demais = LOCKED
    end note

    note right of ARCHIVED
        isActive = false
        Pode ser por: erro, conclusão
        ou substituição por nova versão
    end note
```

**Explicação:**
- Apenas **1 StudyPath** pode ter `isActive=true` por Subject.
- Ao gerar novamente, o path atual vira `ARCHIVED` com `isActive=false` — o histórico é preservado.
- O `ARCHIVED` por conclusão acontece quando a última fase é `COMPLETED` — o `TaskAnalysisProcessor` faz isso automaticamente.

---

### 12. Máquina de Estados — Phase

> **O que é:** Ciclo de vida de uma fase dentro do StudyPath, controlando o aprendizado sequencial.

```mermaid
stateDiagram-v2
    [*] --> LOCKED : PathGenProcessor\ncria phase\n(order > 1)

    [*] --> ACTIVE : PathGenProcessor\ncria phase\n(order = 1)

    LOCKED --> ACTIVE : tryUnlockNext()\nchamado após phase anterior\nser COMPLETED

    ACTIVE --> COMPLETED : Todas as tasks da fase\nsão PASSED\n(TaskAnalysisProcessor)

    note right of LOCKED
        Usuário não pode
        acessar tasks desta fase
    end note

    note right of ACTIVE
        Usuário pode submeter
        tasks desta fase
    end note

    note right of COMPLETED
        Todas as tasks passaram
        Próxima fase desbloqueada
    end note
```

**Explicação:**
- O **sequenciamento forçado** é implementado via status `LOCKED` — o frontend bloqueia acesso a fases `LOCKED`.
- A fase de `order=1` nasce `ACTIVE` automaticamente — o usuário começa imediatamente.
- A transição `LOCKED → ACTIVE` é feita pelo `TaskAnalysisProcessor` chamando `phasesService.tryUnlockNext()`.

---

### 13. Máquina de Estados — Task e Submission

> **O que é:** Estados paralelos de Task (o enunciado) e Submission (a resposta do aluno).

```mermaid
stateDiagram-v2
    state "Task" as T {
        [*] --> T_PENDING : Criada pelo\nPathGenProcessor

        T_PENDING --> T_SUBMITTED : Aluno submete\nPOST /tasks/:id/submit

        T_SUBMITTED --> T_PASSED : score >= 70\n(TaskAnalysisProcessor)

        T_SUBMITTED --> T_FAILED : score < 70\n(TaskAnalysisProcessor)

        T_FAILED --> T_SUBMITTED : Nova tentativa\nPOST /tasks/:id/submit
    }

    state "Submission" as S {
        [*] --> S_PENDING : INSERT submission\nattempt = N+1

        S_PENDING --> S_ANALYZING : Job dequeued\nProcessor inicia

        S_ANALYZING --> S_COMPLETE : Analysis criada\nscore e passed atualizados

        S_ANALYZING --> S_ERROR : Agents Service\nou Gemini falhou
    }

    note right of T_FAILED
        Aluno pode tentar novamente
        Nova Submission criada
        (attempt incrementa)
    end note

    note right of S_COMPLETE
        Analysis record criado
        com feedback, strengths,
        improvements, score
    end note
```

**Explicação:**
- Task e Submission têm ciclos de vida independentes — mas estão sincronizados pelo processor.
- Múltiplas `Submissions` podem existir para uma `Task` (tentativas). A API retorna apenas a **última submission** na tela da task.
- Um `Submission.status = ERROR` não impede nova tentativa — o aluno pode re-submeter.
- `Task.status = FAILED` é transitório — volta para `SUBMITTED` na próxima tentativa.

---

### 14. Máquina de Estados — AgentJob e Content

> **O que é:** Ciclo de vida dos jobs de agente (rastreamento de operações assíncronas) e do conteúdo gerado.

```mermaid
stateDiagram-v2
    state "AgentJob" as J {
        [*] --> J_QUEUED : Job enfileirado\n(Redis/BullMQ)

        J_QUEUED --> J_PROCESSING : Worker dequeued\nstartedAt = NOW()

        J_PROCESSING --> J_COMPLETE : Agente respondeu\ne DB atualizado\ncompletedAt = NOW()

        J_PROCESSING --> J_FAILED : Erro após\n3 tentativas\n(exponential backoff)
    }

    state "Content" as C {
        [*] --> C_PENDING : INSERT content\nPOST /generate

        C_PENDING --> C_STREAMING : ContentProcessor\ndequeuou o job

        C_STREAMING --> C_COMPLETE : Agents retornou\nMarkdown com sucesso

        C_STREAMING --> C_ERROR : Agents ou\nGemini falharam
    }

    note right of J_FAILED
        AgentJob.error registra
        a mensagem de exceção
        para diagnóstico
    end note

    note right of C_STREAMING
        Não é stream real de tokens
        É o status durante
        chamada ao Agents Service
    end note
```

**Explicação:**
- `AgentJob` é o **registro de auditoria** de cada operação assíncrona — permite rastrear o que aconteceu, quando e com qual erro.
- O campo `referenceId` do `AgentJob` é polimórfico: aponta para `studyPathId`, `contentId` ou `submissionId` dependendo do `type`.
- O status `STREAMING` em `Content` não reflete streaming real de tokens — é apenas o período em que o `ContentProcessor` está aguardando resposta do Agents Service.

---

### 15. Arquitetura de Filas BullMQ

> **O que é:** As 3 filas BullMQ, seus producers (services da API) e consumers (processors), com os dados trafegados em cada job.

```mermaid
flowchart TB
    subgraph Producers["📤 Producers (API Services)"]
        SPSvc["StudyPathsService\n.generate()"]
        TkSvc["TasksService\n.submit()"]
        CtSvc["ContentService\n.generateForPhase()"]
    end

    subgraph Redis["⚡ Redis — BullMQ Queues"]
        Q1["Queue: path-generation\nattempts=3\nbackoff=exponential\ntimeout=120s"]
        Q2["Queue: task-analysis\nattempts=3\nbackoff=exponential\ntimeout=90s"]
        Q3["Queue: content-generation\nattempts=3\nbackoff=exponential\ntimeout=60s"]
    end

    subgraph Consumers["📥 Consumers (Processors)"]
        P1["PathGenerationProcessor\n@Process('generate')\n\nJob data:\n- studyPathId\n- subjectTitle\n- skillLevel\n- goals[]"]

        P2["TaskAnalysisProcessor\n@Process('analyze')\n\nJob data:\n- submissionId\n- taskType\n- taskTitle\n- taskDescription\n- submissionContent\n- projectContext?"]

        P3["ContentProcessor\n@Process('generate')\n\nJob data:\n- contentId\n- phaseTitle\n- phaseObjectives[]\n- contentType\n- topic?\n- customPrompt?"]
    end

    subgraph Effects["💾 Side Effects dos Processors"]
        E1["→ Cria Phase + Tasks\n→ Ativa StudyPath\n→ Registra TokenUsage"]
        E2["→ Cria Analysis\n→ Atualiza Submission\n→ Unlock Phase\n→ Registra TokenUsage"]
        E3["→ Atualiza Content.body\n→ Registra TokenUsage"]
    end

    SPSvc -->|"add('generate', data)"| Q1
    TkSvc -->|"add('analyze', data)"| Q2
    CtSvc -->|"add('generate', data)"| Q3

    Q1 --> P1
    Q2 --> P2
    Q3 --> P3

    P1 --> E1
    P2 --> E2
    P3 --> E3

    style Q1 fill:#E74C3C,color:#fff
    style Q2 fill:#E74C3C,color:#fff
    style Q3 fill:#E74C3C,color:#fff
```

**Explicação:**
- As filas têm **timeouts diferentes** calibrados pela complexidade de cada operação: geração de path (120s) > análise de task (90s) > geração de conteúdo (60s).
- Cada processor tem **3 tentativas** com **backoff exponencial** — evita sobrecarregar o Gemini em momentos de latência.
- Os processors são os **únicos pontos** que chamam o `AgentsService` — os controllers nunca chamam o Gemini diretamente.
- O campo `bullJobId` no `AgentJob` é o ID retornado pelo BullMQ ao enfileirar, permitindo correlacionar o registro no banco com o job no Redis.

---

## Glossário de Status

| Entidade | Status possíveis |
|---|---|
| StudyPath | `GENERATING` → `ACTIVE` → `ARCHIVED` |
| Phase | `LOCKED` → `ACTIVE` → `COMPLETED` |
| Task | `PENDING` → `SUBMITTED` → `PASSED` \| `FAILED` |
| Submission | `PENDING` → `ANALYZING` → `COMPLETE` \| `ERROR` |
| Content | `PENDING` → `STREAMING` → `COMPLETE` \| `ERROR` |
| AgentJob | `QUEUED` → `PROCESSING` → `COMPLETE` \| `FAILED` |

## Stack Resumida

| Camada | Tecnologia |
|---|---|
| Frontend | React 18, Vite, Zustand, React Query, Axios |
| API | NestJS 10, TypeORM 0.3, BullMQ, Passport JWT |
| Agents | FastAPI, Python 3.13, Pydantic v2, google-genai SDK |
| LLM | Google Gemini (configurável via `GEMINI_MODEL`) |
| Banco | MySQL (migrações via TypeORM CLI) |
| Fila | Redis (BullMQ — 3 filas dedicadas) |
| Infra | Docker Compose (dev + prod), Nginx (web prod) |
