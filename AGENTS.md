# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Jedi Study is a state-driven multi-agent learning platform (not a chatbot). Users create subjects, generate structured study paths via AI agents, and progress through phases/tasks with AI-powered content and feedback.

**Data flow:** Subject → StudyPath (versioned, async-generated) → Phase (sequential, lockable) → Task → Submission → Analysis

## Monorepo Structure

Each app is fully independent — separate dependencies, Docker images, `.env` files, and docker-compose files. There is no shared build tooling (no pnpm workspaces, no Turborepo).

- **apps/api** — NestJS backend (TypeScript)
- **apps/web** — React PWA with Vite
- **apps/agents** — Python 3.11 FastAPI service with Google Gemini
- **packages/shared** — Zod schemas + TypeScript types (referenced locally by api and web)

## Commands Per App

### API (`apps/api/`)
```bash
npm install
npm run start:dev           # Dev with watch
npm run build && npm start  # Production

# Migrations (run from apps/api/)
npm run db:migration:generate -- src/database/migrations/MigrationName
npm run db:migration:run
npm run db:migration:revert
npm run db:migration:show

# Tests
npm test                            # All tests
npm test -- study-path.schema.spec  # Single test file
npm test -- --watch
```

### Web (`apps/web/`)
```bash
npm install
npm run dev     # Dev server
npm run build   # Production build
```

### Agents (`apps/agents/`)
```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Docker (per app, independent)

Each app has its own `docker-compose.yml` using pre-built images from Docker Hub (`marcosnunesmbs/jedi-study-*`). Copy the `.env.example` in each app folder and adjust before running.

```bash
# Run each independently from its directory
cd apps/api    && docker compose up -d
cd apps/web    && docker compose up -d
cd apps/agents && docker compose up -d
```

**Default ports:**
- API: `3003` (container: 3000)
- Web: `5177` (container: 80)
- Agents: `8008` (container: 8000)

The `docker-compose.yml` at the root is legacy and should be ignored.

## Environment Variables

### `apps/api/.env`
```
DATABASE_URL=mysql://user:pass@host.docker.internal:3306/jedi_study
REDIS_URL=redis://host.docker.internal:6379
JWT_SECRET=...         # openssl rand -hex 32
JWT_EXPIRES_IN=24h
AGENTS_BASE_URL=http://localhost:8008
CORS_ORIGIN=http://localhost:5177
NODE_ENV=production
```

### `apps/web/.env`
```
VITE_API_URL=http://localhost:3003
WEB_PORT=5177
```

### `apps/agents/.env`
```
GOOGLE_API_KEY=...
GEMINI_MODEL=gemini-3.1-flash-lite-preview
GEMINI_INPUT_PRICE_PER_1M=0.25
GEMINI_OUTPUT_PRICE_PER_1M=1.50
GEMINI_MODEL_SAFETY=gemini-2.5-flash-lite   # Separate model for safety checks
GEMINI_SAFETY_INPUT_PRICE_PER_1M=0.10
GEMINI_SAFETY_OUTPUT_PRICE_PER_1M=0.40
API_ORIGIN=http://localhost:3003
AGENTS_PORT=8008
```

## Architecture Details

### API (NestJS)
- **Auth:** Global `JwtAuthGuard` as `APP_GUARD`. Use `@Public()` for open endpoints. `@CurrentUser()` extracts user from JWT.
- **Validation:** DTOs use class-validator + class-transformer with `whitelist: true`. `strictNullChecks: false` in tsconfig.
- **Async jobs:** BullMQ queues (Redis) with 3 attempts + exponential backoff.
- **Job flow:** API creates record (status: GENERATING) → enqueues BullMQ job → processor calls agents service → validates response with Zod → hydrates DB in TypeORM transaction → records token usage.
- **Response format:** Global `HttpExceptionFilter` + `TransformInterceptor` wraps all responses as `{success, data}` — unwrapped by the Axios interceptor on the client.
- **Safety gate:** Every user-initiated action (path generation, content generation, task submission) calls `SafetyService.validateInput()` before enqueueing — calls the Python safety agent and records token usage.

### Async Job Queue Details

Three BullMQ queues (defined in `src/queues/`):
- `path-generation` → `path-generation.processor.ts` (`@Process('generate')`)
- `task-analysis` → `task-analysis.processor.ts` (`@Process('analyze')`)
- `content-generation` → `content.processor.ts` (`@Process('generate')`)

**Phase unlock logic (runs after task analysis):** If a submission passes and ALL tasks in the phase are `PASSED`, calls `PhasesService.markCompleted()` then `PhasesService.tryUnlockNext()`. When all phases are `COMPLETED`, the `StudyPath` is set to `ARCHIVED`.

**Recovery mechanism:** Each service has `ensureAgentJob()` — if a record is stuck in `GENERATING`/`PENDING` with no `AgentJob`, it re-enqueues. Handles API/Redis crashes mid-operation.

**JSON-serialized fields:** `Phase.objectives`, `Phase.topics`, `Task.projectContext`, `Content.input` are stored as JSON strings — must be `JSON.stringify()`/`JSON.parse()`d manually.

**Token usage:** Every agent call (including safety) records a `TokenUsage` row with model, input/output tokens, estimated cost USD, and duration.

### Database

- **ORM:** TypeORM with MySQL (`synchronize: false`)
- **DataSource:** `apps/api/src/database/data-source.ts`
- **Entities:** `apps/api/src/database/entities/` — User, Subject, StudyPath, Phase, Task, Submission, Analysis, Content, AgentJob, TokenUsage
- **Migrations:** `apps/api/src/database/migrations/` — always use migrations, never `synchronize: true`

### Agents (Python)
- 5 agents: PathGenerator, ContentGen, TaskAnalyzer, ProjectAnalyzer, Safety
- Each is a FastAPI router under `/agents/{name}`
- Base utilities in `agents/base.py`: `get_client()`, `TokenUsageInfo`, `AgentResponse`
- Safety agent uses a separate, cheaper Gemini model (`GEMINI_MODEL_SAFETY`)

### Web (React)
- Zustand for auth state (persisted to localStorage as `auth-storage`), React Query for server state, Axios for API calls
- React Router with `PrivateRoute` guard
- `VITE_API_URL` env var sets the API base URL (no dev proxy — direct URL)
- React Query defaults: `staleTime: 5min`, `retry: 1`
- **Polling pattern:** `setInterval(() => refetch(), 3000)` in `useEffect`, cleared when job completes. Used in `SubjectPage` (path generation) and `TaskPage` (submission analysis).

**React Query key conventions:** `['subject', id]`, `['study-path-active', subjectId]`, `['phase', id]`, `['task', id]`, `['analysis', submissionId]`

### Shared Package (`packages/shared`)
- Zod schemas: `StudyPathOutputSchema`, `TaskAnalysisOutputSchema`, `ProjectAnalysisOutputSchema`
- Status enums: `PhaseStatus`, `TaskStatus`, `StudyPathStatus`
- `AgentResponse<T>` interface with `TokenUsageInfo`
- Referenced locally by api and web (not published to npm)
