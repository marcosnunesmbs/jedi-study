## ADDED Requirements

### Requirement: Calculate subject progress percentage
The system SHALL compute a subject's progress as the percentage of tasks with status `PASSED` relative to the total number of tasks across all phases of the subject's active study path. The result MUST be an integer (0–100) rounded with `Math.round`.

#### Scenario: Subject with some tasks passed
- **WHEN** a subject has an active study path with 8 total tasks and 3 have status `PASSED`
- **THEN** the progress SHALL be `Math.round(3/8 * 100)` = 38

#### Scenario: Subject with no active study path
- **WHEN** a subject has no active study path
- **THEN** the progress SHALL be 0

#### Scenario: Subject with active study path but zero tasks
- **WHEN** a subject has an active study path with phases but no tasks exist yet
- **THEN** the progress SHALL be 0

#### Scenario: All tasks passed
- **WHEN** all tasks in the active study path have status `PASSED`
- **THEN** the progress SHALL be 100

### Requirement: Include progress in subjects list response
The subjects list endpoint SHALL return a `progress` field (integer, 0–100) for each subject alongside the existing response data.

#### Scenario: List subjects with progress
- **WHEN** an authenticated user requests their subjects list
- **THEN** each subject in the response SHALL include a `progress` field with the computed value

### Requirement: Display progress on subject card
The subject card on the dashboard SHALL render a progress bar reflecting the real `progress` value returned by the API.

#### Scenario: Subject with study path generating
- **WHEN** a subject's active study path has status `GENERATING`
- **THEN** the card SHALL display a spinner instead of the progress bar

#### Scenario: Subject with computed progress
- **WHEN** a subject has a `progress` value and the study path is not `GENERATING`
- **THEN** the card SHALL display a progress bar at the given percentage with the numeric value visible
