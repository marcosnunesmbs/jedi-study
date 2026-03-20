## Why

This change introduces a safety and cost-control layer for agent inputs. By synchronously validating prompts for injection and checking token budgets before queuing expensive background tasks, we ensure system integrity and prevent unexpected costs.

## What Changes

- **New Synchronous Safety Agent**: A dedicated agent in `apps/agents` to analyze inputs for prompt injection.
- **Pre-Queue Validation Middleware**: A new service layer in `apps/api` to intercept input before it's added to the Bull queue.
- **Structured Safety Response**: A standardized format (`safe_prompt: boolean`) for all safety checks.
- **Frontend Error Notifications**: Global interceptor to display safety and budget errors to users.

## Capabilities

### New Capabilities
- `input-safety`: Core logic for prompt injection detection and safety reporting.

### Modified Capabilities
- `token-usage`: Enhanced to support recording usage for safety checks.

## Impact

- **API Modules**: `ContentService`, `StudyPathsService`, and `TasksService` will now call the safety middleware.
- **Agents Service**: `AgentsService` in NestJS will have a new endpoint to communicate with the Safety Agent.
- **Agent Service (Python)**: A new router and agent logic for safety checks.
- **Token Usage**: `TokenUsageService` will be updated with limit checking methods.
