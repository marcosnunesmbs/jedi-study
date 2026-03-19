## Why

To allow for greater flexibility in local development and production deployments by decoupling infrastructure services (MySQL and Redis) from the Docker Compose file. This enables using external managed services or local native installations more easily.

## What Changes

- Removal of `db` (MySQL) and `redis` services from `docker-compose.yml`.
- Removal of persistent volumes for MySQL and Redis from `docker-compose.yml`.
- Standardizing the `api` service environment variables in `docker-compose.yml` to use direct URL strings from the host environment.
- Refactoring `AppModule.ts` to use `ConfigService` for Redis configuration (consistency).
- Updating `.env.example` to reflect the new external service requirement.

## Capabilities

### New Capabilities
- None. This is an infrastructure refactoring.

### Modified Capabilities
- None. System behavior remains the same.

## Impact

- **Infrastructure**: `docker-compose.yml` becomes smaller and focused only on the application and agents.
- **Developer Workflow**: Developers must ensure MySQL and Redis are running (locally or via their own containers) before starting the app via Compose.
- **API**: `AppModule.ts` and `configuration.ts` patterns are standardized.
