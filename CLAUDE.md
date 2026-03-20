# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Jedi Study is a state-driven multi-agent learning platform (not a chatbot). Users create subjects, generate structured study paths via AI agents, and progress through phases/tasks with AI-powered content and feedback.

**Data flow:** Subject → StudyPath (versioned, async-generated) → Phase (sequential, lockable) → Task → Submission → Analysis

## Monorepo Structure

- **apps/api** — NestJS backend (TypeScript, port 3000)
- **apps/web** — React PWA with Vite (port 5173)
- **apps/agents** — Python 3.11 FastAPI service with Google Gemini (port 8000)
- **packages/shared** — Zod schemas + TypeScript types shared across apps

## Build & Dev Commands

```bash
pnpm install                    # Install all dependencies
pnpm dev                        # Run all apps in parallel (turbo)
pnpm build                      # Build all (respects dependency order)
pnpm lint                       # TypeScript type-check (tsc --noEmit) per app
pnpm test                       # Run tests across workspaces

# Run a single test file (from apps/api/)
pnpm test -- study-path.schema.spec.ts
pnpm test -- --watch            # Watch mode

# Scoped commands
pnpm --filter api dev           # Run only the API
pnpm --filter web dev           # Run only the frontend
pnpm --filter shared build      # Build shared package

# Database (run from apps/api/)
pnpm db:generate                # prisma generate
pnpm db:migrate                 # prisma migrate dev

# Agents (run from apps/agents/)
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Docker (full stack)
docker-compose up --build
```

## Build Order

Respect this dependency chain: **shared → prisma generate → api → web**. Turborepo handles this automatically via `turbo.json` `dependsOn: ["^build"]`.

## Architecture Details

### API (NestJS)
- **Auth:** Global `JwtAuthGuard` on all routes (`APP_GUARD` in `app.module.ts`). Use `@Public()` decorator for open endpoints. `@CurrentUser()` extracts user from JWT.
- **Validation:** DTOs use class-validator + class-transformer with `whitelist: true`. API tsconfig has `strictNullChecks: false`.
- **Async jobs:** BullMQ queues (Redis) for path generation, content generation, and task analysis. Jobs have 3 attempts with exponential backoff.
- **Job flow:** API creates record (status: GENERATING) → enqueues BullMQ job → processor calls agents service → validates response with Zod → hydrates DB in Prisma transaction → records token usage.
- **Response format:** Global `HttpExceptionFilter` + `TransformInterceptor` for consistent API responses (`{success, data}` wrapper — unwrapped by Axios interceptor on the client).
- **Safety gate:** Every user-initiated action (path generation, content generation, task submission) calls `SafetyService.validateInput()` before enqueueing — this calls the Python safety agent and records token usage.

### Async Job Queue Details

Three BullMQ queues (defined in `src/queues/`):
- `path-generation` — processor: `@Process('generate')` in `path-generation.processor.ts`
- `task-analysis` — processor: `@Process('analyze')` in `task-analysis.processor.ts`
- `content-generation` — processor: `@Process('generate')` in `content.processor.ts`

**Phase unlock logic (runs after task analysis):** If a submission passes, the processor checks whether ALL tasks in the phase are `PASSED`. If so, it calls `PhasesService.markCompleted()` then `PhasesService.tryUnlockNext()` — setting the next phase to `ACTIVE`. When all phases are `COMPLETED`, the `StudyPath` is set to `ARCHIVED`.

**Recovery mechanism:** Each service has `ensureAgentJob()` — if a record is stuck in `GENERATING`/`PENDING` with no corresponding `AgentJob`, it re-enqueues the job. Handles API/Redis crashes mid-operation.

**JSON-serialized fields:** `Phase.objectives`, `Phase.topics`, `Task.projectContext`, and `Content.input` are stored as JSON strings in the DB and must be `JSON.stringify()`/`JSON.parse()`d manually.

**Token usage:** Every agent call (including safety checks) records a `TokenUsage` row with model, input/output tokens, estimated cost USD, and duration.

### Agents (Python)
- 5 agents: PathGenerator, ContentGen, TaskAnalyzer, ProjectAnalyzer, Safety
- Each is a FastAPI router under `/agents/{name}`
- Uses Google Generative AI SDK (Gemini), async throughout
- Pydantic models for validation, token usage tracking from response metadata
- Base utilities in `agents/base.py`: `get_client()`, `TokenUsageInfo`, `AgentResponse`

### Web (React)
- Zustand for auth state (persisted to localStorage as `auth-storage`), React Query for server state, Axios for API calls
- React Router with `PrivateRoute` guard
- Vite dev proxy forwards `/api` to backend (client uses `baseURL: '/api'`)
- React Query defaults: `staleTime: 5min`, `retry: 1`
- **Polling pattern** for async jobs: `setInterval(() => refetch(), 3000)` inside `useEffect`, cleared when job completes (e.g., `path.status !== 'GENERATING'`). Used in `SubjectPage` and `TaskPage`.

**React Query key conventions:**
- `['subject', subjectId]`, `['study-path-active', subjectId]`
- `['phase', phaseId]`, `['task', taskId]`
- `['analysis', submissionId]`

### Shared Package
- Zod schemas: `StudyPathOutputSchema`, `TaskAnalysisOutputSchema`, `ProjectAnalysisOutputSchema`
- Status enums: `PhaseStatus`, `TaskStatus`, `StudyPathStatus`
- `AgentResponse<T>` interface with `TokenUsageInfo`

## Environment Setup

Copy `.env.example` and configure. Key vars:
- `DATABASE_URL` — SQLite path relative to `apps/api/` (e.g., `file:../../data/jedi.db`)
- `REDIS_URL` — Redis connection (default: `redis://localhost:6379`)
- `JWT_SECRET` — Generate with `openssl rand -hex 32`
- `GOOGLE_API_KEY` — Gemini API key
- `AGENTS_BASE_URL` — Python agent service URL (`http://localhost:8000`)
- `GEMINI_MODEL` — Model for general agents (e.g., `gemini-3.1-flash-lite-preview`)
- `GEMINI_INPUT_PRICE_PER_1M` / `GEMINI_OUTPUT_PRICE_PER_1M` — Cost tracking for general agents
- `GEMINI_MODEL_SAFETY` — Separate model for the safety agent (e.g., `gemini-2.5-flash-lite`)
- `GEMINI_SAFETY_INPUT_PRICE_PER_1M` / `GEMINI_SAFETY_OUTPUT_PRICE_PER_1M` — Cost tracking for safety agent
- `API_ORIGIN` — Allowed CORS origin for the agents service (e.g., `http://localhost:3000`)
- `AGENTS_PORT` — Port for the Python agents service (default: 8000, overridable)
- `AGENTS_TIMEOUT_MS` — HTTP timeout for agent calls from the API (default: 120000)

## Database

- **ORM:** Prisma with SQLite
- **Schema location:** `apps/api/prisma/schema.prisma`
- **Entities:** User, Subject, StudyPath, Phase, Task, Submission, Analysis, Content, AgentJob, TokenUsage
- Run migrations from `apps/api/`: `npx prisma migrate dev`

## Docker Compose Services

redis (6379) → agents (8000) → api (3000, runs migrate on start) → web (nginx:80)
