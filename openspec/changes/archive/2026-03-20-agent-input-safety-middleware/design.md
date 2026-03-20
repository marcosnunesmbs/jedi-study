## Context

Currently, user-provided inputs for agent tasks (content generation, path generation, task analysis) are added directly to Bull queues. This poses security risks (prompt injection) and cost risks (expensive model calls without budget checks).

## Goals / Non-Goals

**Goals:**
- Implement a synchronous safety check for prompt injection.
- Standardize the safety check response.
- Provide clear error feedback to users for unsafe inputs.

**Non-Goals:**
- Implementing the actual content generation or path generation logic (this exists).
- Providing comprehensive moderation (focused on prompt injection).
- Implementing budget enforcement at this stage.

## Decisions

### 1. Synchronous Safety Agent
**Decision**: Create a dedicated safety agent in `apps/agents` using a low-latency model.
**Rationale**: Prompt injection checks must be fast to avoid significant UX impact.
**Fallback Logic**: The agent will use `GEMINI_MODEL_SAFETY` from environment variables, falling back to the default `GEMINI_MODEL` if not specified.
**Alternatives**: 
- Using a library (less flexible).
- Checking in NestJS (adds complexity and lacks LLM power).

### 2. Validation Service Middleware
**Decision**: A new `SafetyService` in `apps/api` to coordinate safety checks and record usage.
**Rationale**: This service can be injected into any service that manages a queue.
**Alternatives**:
- Adding logic directly to each controller/service (redundant).

### 3. Safety Check Before Queuing
**Decision**: Execute the safety check before adding the job to the Bull queue.
**Rationale**: Prevents malicious jobs from ever entering the processing pipeline.

### 4. Global Frontend Error Interceptor
**Decision**: Use an Axios interceptor in the web app to catch 400/403 errors and show toasts.
**Rationale**: Centralizes error handling so that any blocked agent call provides immediate feedback to the user.

## Risks / Trade-offs

- **Latency** → Using a fast model and specific prompts to minimize delay.
- **False Positives** → Tuning the prompt to be cautious but not over-restrictive.
- **Cost of Check** → The safety check itself consumes tokens, but significantly fewer than the target task. Recording its usage is essential for visibility.
