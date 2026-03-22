## 1. Backend — Progress Calculation

- [x] 1.1 Add progress subquery to `SubjectsService.findAll()` — join active study path → phases → tasks, count PASSED vs total, return as `progress` integer field
- [x] 1.2 Handle edge cases: no active study path → 0, zero tasks → 0, division safety

## 2. Frontend — Subject Card Progress

- [x] 2.1 Update subject card on DashboardPage to use the real `progress` value from the API instead of hardcoded values
- [x] 2.2 Show spinner on subject card when study path status is `GENERATING` instead of progress bar
- [x] 2.3 Display rounded percentage text alongside the progress bar
