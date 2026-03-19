# Jedi Study

Jedi Study is an AI-powered personalized learning platform that generates custom study paths, educational content, and provides automated analysis of student tasks. It uses a multi-agent architecture powered by Google's Gemini 1.5 Pro to guide users through any subject from beginner to advanced levels.

## Features

- **Personalized Study Paths** — Generate structured learning journeys based on your goals and skill level.
- **AI Content Generation** — On-demand explanations, examples, summaries, and resource lists.
- **Ask AI** — Custom prompts for specific clarifications or analogies within any learning phase.
- **Automated Task Analysis** — Submit answers or project descriptions and receive a score (0–100), detailed feedback, strengths, and improvements.
- **Token & Cost Monitoring** — Real-time dashboard to track API consumption and estimated costs.

## Architecture

Three independent services — each has its own `Dockerfile` and `docker-compose.yml`:

| Service | Stack | Default port |
|---------|-------|-------------|
| **web** | React 18, TypeScript, Vite, TanStack Query, Zustand | 5177 |
| **api** | NestJS, TypeORM, MySQL, BullMQ | 3003 |
| **agents** | Python 3.11, FastAPI, Google Generative AI (Gemini) | 8008 |

External dependencies (provided via env vars): **MySQL 8** and **Redis**.

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- MySQL 8 and Redis running (locally or as managed services)
- [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### Running all services together (recommended)

Both options below use a single `docker-compose` at the project root and read variables from the root `.env`.

```bash
cp .env.example .env   # fill in all required variables (see table below)
```

#### Production images (pull from Docker Hub)

```bash
docker compose up -d
# web  → http://localhost:5177
# api  → http://localhost:3003
# agents → http://localhost:8008/health
```

#### Development (build from source with hot reload)

```bash
docker compose -f docker-compose.dev.yml up --build
# web  → http://localhost:5177
# api  → http://localhost:3003  (nest start --watch)
# agents → http://localhost:8008/health  (uvicorn --reload)
```

> **Hot reload:** API and agents reload on file changes via volume mounts. The web is served via nginx (static build); changes require rebuilding the container.

To stop either stack:

```bash
docker compose down
# or
docker compose -f docker-compose.dev.yml down
```

---

### Running each service individually

Each service also has its own `docker-compose.yml` inside its folder. Run them in any order after configuring their `.env`.

#### Agents

```bash
cd apps/agents
cp .env.example .env   # fill in GOOGLE_API_KEY
docker compose up --build
# → http://localhost:8008/health
```

#### API

```bash
cd apps/api
cp .env.example .env   # fill in DATABASE_URL, REDIS_URL, JWT_SECRET
docker compose up --build
# → http://localhost:3003
```

The API runs `prisma migrate deploy` on startup to apply database migrations automatically.

#### Web

```bash
cd apps/web
cp .env.example .env   # set VITE_API_URL=http://localhost:3003
docker compose up --build
# → http://localhost:5177
```

### Local development (without Docker)

```bash
# Agents
cd apps/agents
pip install -r requirements.txt
uvicorn main:app --reload --port 8008

# API
cd apps/api
npm install
npm run start:dev

# Web
cd apps/web
npm install
npm run dev
```

## Environment variables

Each app has its own `.env.example`. Key variables:

| App | Variable | Description |
|-----|----------|-------------|
| agents | `GOOGLE_API_KEY` | Gemini API key |
| agents | `GEMINI_INPUT_PRICE_PER_1M` / `GEMINI_OUTPUT_PRICE_PER_1M` | Cost per 1M tokens (USD) |
| api | `DATABASE_URL` | MySQL connection string |
| api | `REDIS_URL` | Redis connection string |
| api | `JWT_SECRET` | Generate with `openssl rand -hex 32` |
| api | `AGENTS_BASE_URL` | URL of the agents service |
| web | `VITE_API_URL` | URL of the API (baked in at build time) |

## License

This project is for educational purposes. Feel free to use and modify it.
