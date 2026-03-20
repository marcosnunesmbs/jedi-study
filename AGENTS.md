# AGENTS.md

This file provides guidance to Any Agent Code when working with code in this repository.

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
- **Auth:** Global `JwtAuthGuard` on all routes. Use `@Public()` decorator for open endpoints. `@CurrentUser()` extracts user from JWT.
- **Validation:** DTOs use class-validator + class-transformer with `whitelist: true`.
- **Async jobs:** BullMQ queues (Redis) for path generation, content generation, and task analysis. Jobs have 3 attempts with exponential backoff.
- **Job flow:** API creates record (status: GENERATING) → enqueues BullMQ job → processor calls agents service → validates response with Zod → hydrates DB in Prisma transaction → records token usage.
- **Response format:** Global `HttpExceptionFilter` + `TransformInterceptor` for consistent API responses.

### Agents (Python)
- 4 agents: PathGenerator, ContentGen, TaskAnalyzer, ProjectAnalyzer
- Each is a FastAPI router under `/agents/{name}`
- Uses Google Generative AI SDK (Gemini), async throughout
- Pydantic models for validation, token usage tracking from response metadata

### Web (React)
- Zustand for auth state, React Query for server state, Axios for API calls
- React Router with `PrivateRoute` guard
- Vite proxy forwards `/api` to backend

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

## Database

- **ORM:** Prisma with SQLite
- **Schema location:** `apps/api/prisma/schema.prisma`
- **Entities:** User, Subject, StudyPath, Phase, Task, Submission, Analysis, Content, AgentJob, TokenUsage
- Run migrations from `apps/api/`: `npx prisma migrate dev`

## Docker Compose Services

redis (6379) → agents (8000) → api (3000, runs migrate on start) → web (nginx:80)
