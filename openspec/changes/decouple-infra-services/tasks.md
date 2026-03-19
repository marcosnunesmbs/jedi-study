## 1. API Configuration

- [x] 1.1 Refactor `BullModule.forRootAsync` in `apps/api/src/app.module.ts` to use `ConfigService` for Redis URL.

## 2. Infrastructure Cleanup

- [x] 2.1 Remove `db` and `redis` service blocks from `docker-compose.yml`.
- [x] 2.2 Remove `mysql_data` and `redis_data` volumes from `docker-compose.yml`.
- [x] 2.3 Update the `api` service environment variables in `docker-compose.yml` to use direct host mapping for `DATABASE_URL` and `REDIS_URL`.

## 3. Environment Documentation

- [x] 3.1 Update `.env.example` with clear defaults for local development services.

## 4. Verification

- [ ] 4.1 Verify application starts correctly via `docker-compose up` with external services configured.
- [ ] 4.2 Verify application connects to MySQL and Redis correctly when starting natively (outside Docker).
