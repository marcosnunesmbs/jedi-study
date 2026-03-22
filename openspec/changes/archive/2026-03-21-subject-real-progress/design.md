## Context

Subject cards on the dashboard currently show hardcoded progress (10% or 0%). The data to compute real progress already exists: tasks have a `status` field with `PASSED` as the completion state, and phases belong to study paths which belong to subjects. No schema changes are needed — this is a computed value.

## Goals / Non-Goals

**Goals:**
- Calculate subject progress as `Math.round(passedTasks / totalTasks * 100)` server-side
- Return progress in the subjects list endpoint response
- Render real progress on subject cards, with spinner for GENERATING paths

**Non-Goals:**
- Storing progress in the database (it's always computed)
- Per-phase progress breakdown (future work)
- Handling ARCHIVED study paths specially (will be hidden in a separate change)

## Decisions

### 1. Server-side computed field via SQL subquery
**Choice:** Add a SQL subquery in `SubjectsService.findAll()` using TypeORM's query builder to count passed vs total tasks for the active study path.

**Alternatives considered:**
- *Eager-load all phases+tasks and compute in JS:* Fetches too much data, N+1 risk
- *Stored/materialized field:* Adds write complexity and staleness risk for a simple count
- *Frontend computation:* Requires shipping all task data to the client

**Rationale:** A SQL subquery is a single efficient query, keeps the logic centralized, and avoids shipping unnecessary data.

### 2. Progress = 0 when no active study path
**Choice:** Return `progress: 0` when the subject has no active study path (not yet generated or no path at all).

**Rationale:** Simpler than returning null — the frontend doesn't need to handle a missing value separately.

### 3. Frontend spinner for GENERATING status
**Choice:** When `studyPaths[0]?.status === 'GENERATING'`, show a spinner instead of the progress bar. Otherwise show the progress bar with the real percentage.

**Rationale:** During generation, progress is meaningless (no tasks exist yet). A spinner signals that work is in progress.

## Risks / Trade-offs

- **[Performance]** Subquery on every `findAll` call adds a join across study_path → phase → task. → Mitigated: these are small tables per user, and the query is indexed by userId and studyPathId.
- **[Edge case: 0 tasks]** A study path with phases but no tasks would cause division by zero. → Mitigated: use `NULLIF` or `CASE WHEN totalTasks = 0 THEN 0` in SQL, or handle in JS.
