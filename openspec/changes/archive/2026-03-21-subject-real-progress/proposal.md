## Why

The subject cards on the dashboard show hardcoded progress values (10% if a study path exists, 0% otherwise). Users have no way to see their actual learning progress. Calculating real progress based on passed tasks vs total tasks gives meaningful feedback.

## What Changes

- Add a `progress` field (0–100, integer) to the subject list API response, calculated server-side
- Backend counts tasks with status `PASSED` vs total tasks across all phases of the active study path
- Subjects without a generated study path return `progress: 0`
- Frontend renders the real progress percentage on each subject card
- Subjects with study path in `GENERATING` status show a spinner instead of a progress bar

## Capabilities

### New Capabilities
- `subject-progress`: Server-side calculation of subject completion percentage based on task pass rate, exposed via the subjects list endpoint

### Modified Capabilities
- `subjects`: The list endpoint response shape changes to include a `progress` field

## Impact

- **API**: `SubjectsService.findAll()` and its response DTO — adds progress calculation query
- **Web**: Dashboard subject cards — replaces hardcoded progress with real values
- **Database**: No schema changes — progress is computed, not stored
