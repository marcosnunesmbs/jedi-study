## Context

The current `docker-compose.yml` file is cluttered with infrastructure services (MySQL, Redis) that are also partially configured via environment variables. This creates a dependency on Docker for local development even when native services might be preferred, and complicates production deployments that use managed database/cache services.

## Goals / Non-Goals

**Goals:**
- Decouple application services from specific infrastructure container definitions.
- Standardize on single environment variables (`DATABASE_URL`, `REDIS_URL`) for all infrastructure connectivity.
- Leaner Docker Compose configuration focused on application logic and custom agents.

**Non-Goals:**
- Changing the database provider (staying with MySQL).
- Changing the cache provider (staying with Redis).

## Decisions

### 1. Unified Infrastructure Connection Strings
Standardize on the use of `DATABASE_URL` and `REDIS_URL` across all configuration files and application modules.
- **Rationale**: Single connection strings are standard in modern cloud environments and simplify configuration management.

### 2. Standardizing `AppModule` Configuration
Refactor `BullModule.forRootAsync` in `AppModule.ts` to use `ConfigService` instead of `process.env`.
- **Rationale**: Consistency with `TypeOrmModule` and better alignment with NestJS best practices for configuration management.

### 3. Lean Docker Compose
Remove the `db` and `redis` service blocks from `docker-compose.yml`.
- **Rationale**: Reduces the surface area of the project's infrastructure management. Developers can manage these services independently (using local native installs, separate Docker commands, or managed cloud services).

## Risks / Trade-offs

- **[Risk]** Developer confusion when services aren't running. → **Mitigation** Update `.env.example` with clear defaults for local development (e.g., `localhost:3306`).
- **[Trade-off]** Slightly more manual setup for new developers. → **Rationale** The flexibility gained for production-like environments and CI/CD pipelines outweighs the minor initial setup cost.
