## 1. Safety Agent Implementation (Python)

- [x] 1.1 Create `apps/agents/agents/safety` module with prompts and output schema (`safe_prompt: bool`).
- [x] 1.2 Implement `generate_safety_report` in `apps/agents/agents/safety/agent.py`.
- [x] 1.3 Add `GEMINI_MODEL_SAFETY` to `apps/agents/config.py` with fallback to `GEMINI_MODEL`.
- [x] 1.4 Create a new router `apps/agents/routers/safety.py` and register it in `main.py`.
- [x] 1.5 Update `build_usage` and all agents to support dynamic model pricing.

## 2. API Safety Service (NestJS)

- [x] 2.1 Update `AgentsService` in `apps/api` to include the `checkSafety` method.
- [x] 2.2 Create `SafetyService` in `apps/api/src/modules/agents` to coordinate safety and record usage.
- [x] 2.3 Define custom exception for `UnsafePromptException`.

## 3. Integration and Verification

- [x] 3.1 Integrate `SafetyService` into `ContentService` before queuing `content-generation` jobs.
- [x] 3.2 Integrate `SafetyService` into `StudyPathsService` before queuing `path-generation` jobs.
- [x] 3.3 Integrate `SafetyService` into `TasksService` before queuing `task-analysis` jobs.
- [x] 3.4 Verify the full flow with safe and unsafe prompts.

## 4. Frontend Error Handling

- [x] 4.1 Install `react-hot-toast` in `apps/web`.
- [x] 4.2 Add `Toaster` to `apps/web/src/main.tsx`.
- [x] 4.3 Add global error interceptor to `apps/web/src/api/client.ts` to display error toasts.
