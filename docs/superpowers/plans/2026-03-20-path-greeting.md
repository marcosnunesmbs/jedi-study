# Study Path Greeting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar uma saudação motivadora e instrutiva para as trilhas de estudo geradas por IA, integrando Agentes, API e Frontend.

**Architecture:** 
- O Agente de IA gera um campo `welcomeMessage` baseado nos objetivos do usuário.
- O serviço de API valida esse campo via Zod e o persiste em uma nova coluna na tabela `study_paths`.
- O Frontend exibe essa mensagem no topo da página do assunto usando o padrão de estilos existente.

**Tech Stack:** Python (FastAPI/Pydantic), Node.js (NestJS/TypeORM/Zod), React (TypeScript).

---

### Task 1: Setup Testing and Update AI Agent Schema (TDD)

**Files:**
- Modify: `apps/agents/pyproject.toml`
- Modify: `apps/agents/agents/path_generator/output_schema.py`
- Modify: `apps/agents/agents/path_generator/prompts.py`
- Create: `apps/agents/agents/path_generator/test_schema.py`

- [ ] **Step 1: Add pytest to agents dependencies**
Modify `apps/agents/pyproject.toml`:
```toml
dependencies = [
    ...,
    "pytest>=8.0.0",
]
```
Run: `cd apps/agents && pip install pytest` (or `uv sync` if using uv)

- [ ] **Step 2: Write a failing test for the new schema field**
Create `apps/agents/agents/path_generator/test_schema.py`:
```python
import pytest
from pydantic import ValidationError
from agents.path_generator.output_schema import StudyPathOutput

def test_study_path_output_requires_welcome_message():
    data = {
        "subject": "Test Subject",
        "skillLevel": "BEGINNER",
        "estimatedHours": 10,
        "totalPhases": 1,
        "phases": [
            {
                "order": 1,
                "title": "Phase 1",
                "description": "Desc",
                "objectives": ["Obj"],
                "topics": ["Topic"],
                "estimatedHours": 5,
                "tasks": [
                    {"order": 1, "title": "Task 1", "description": "Desc", "type": "READING"}
                ]
            }
        ]
    }
    with pytest.raises(ValidationError):
        StudyPathOutput(**data)
```

- [ ] **Step 3: Run the test to verify it fails**
Run: `cd apps/agents && pytest agents/path_generator/test_schema.py`
Expected: FAIL (ValidationError)

- [ ] **Step 4: Add welcomeMessage to output schema**
Modify `apps/agents/agents/path_generator/output_schema.py`:
```python
class StudyPathOutput(BaseModel):
    subject: str
    welcomeMessage: str = Field(..., description="A motivating and instructive greeting for the user")
    # ... existing fields
```

- [ ] **Step 5: Verify test passes**
Update `test_schema.py` to include `welcomeMessage` and run pytest.
Expected: PASS

- [ ] **Step 6: Update SYSTEM_PROMPT with instructions**
Modify `apps/agents/agents/path_generator/prompts.py` to include `welcomeMessage` in the JSON example and instructions. Ensure it emphasizes creating the message in the student's language.

- [ ] **Step 7: Commit Agent changes**
```bash
git add apps/agents/
git commit -m "feat(agents): add welcomeMessage to study path generation with tests"
```

### Task 2: Update API Database and Schema (TDD)

**Files:**
- Modify: `apps/api/src/database/entities/study-path.entity.ts`
- Modify: `apps/api/src/shared/schemas/study-path.schema.ts`
- Create: `apps/api/src/shared/schemas/study-path.schema.spec.ts`

- [ ] **Step 1: Write a failing test for the Zod schema**
Create `apps/api/src/shared/schemas/study-path.schema.spec.ts`:
```typescript
import { StudyPathOutputSchema } from './study-path.schema';

describe('StudyPathOutputSchema', () => {
  it('should require welcomeMessage', () => {
    const data = {
      subject: 'Test',
      skillLevel: 'BEGINNER',
      estimatedHours: 10,
      totalPhases: 1,
      phases: []
    };
    const result = StudyPathOutputSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**
Run: `cd apps/api && npm test src/shared/schemas/study-path.schema.spec.ts`
Expected: FAIL

- [ ] **Step 3: Update Zod validation schema**
Modify `apps/api/src/shared/schemas/study-path.schema.ts` to include `welcomeMessage: z.string().optional().default('')` (for backward compatibility).

- [ ] **Step 4: Verify test passes**
Update test to expect success if using defaults or failure if strictly required. Run test.
Expected: PASS

- [ ] **Step 5: Add welcomeMessage column to Entity**
Modify `apps/api/src/database/entities/study-path.entity.ts`:
```typescript
@Column({ type: 'text', nullable: true })
welcomeMessage: string | null;
```

- [ ] **Step 6: Generate and run database migration**
Run: `cd apps/api && npm run db:migration:generate -- src/database/migrations/AddWelcomeMessageToStudyPath`
Run: `cd apps/api && npm run db:migration:run`

- [ ] **Step 7: Commit API changes**
```bash
git add apps/api/
git commit -m "feat(api): add welcomeMessage to StudyPath entity and schema"
```

### Task 3: Update Queue Processor (TDD)

**Files:**
- Modify: `apps/api/src/queues/path-generation.processor.ts`

- [ ] **Step 1: Map welcomeMessage in the processor**
Modify `apps/api/src/queues/path-generation.processor.ts` inside the `dataSource.transaction`:
```typescript
await manager.update(StudyPath, studyPathId, {
  status: 'ACTIVE',
  welcomeMessage: parsed.welcomeMessage, // Use 'parsed' which is the validated object
  completedAt: new Date(),
});
```

- [ ] **Step 2: Commit Processor changes**
```bash
git add apps/api/src/queues/path-generation.processor.ts
git commit -m "feat(api): map welcomeMessage in path-generation processor"
```

### Task 4: Display Welcome Message in Frontend

**Files:**
- Modify: `apps/web/src/pages/SubjectPage.tsx`

- [ ] **Step 1: Update SubjectPage to display the message**
In `apps/web/src/pages/SubjectPage.tsx`, find the `path?.phases` rendering.
Insert the following section immediately before the `Learning Phases` heading:
```tsx
{path?.welcomeMessage && (
  <div style={{ 
    background: 'rgba(124, 58, 237, 0.05)', 
    borderLeft: '4px solid var(--primary)', 
    padding: '1.5rem', 
    marginBottom: '2rem', 
    borderRadius: '0 0.75rem 0.75rem 0',
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start'
  }}>
    <div style={{ color: 'var(--primary)', marginTop: '0.25rem' }}>
      <Sparkles size={24} />
    </div>
    <p style={{ 
      color: 'var(--text-slate-700)', 
      fontSize: '1rem', 
      lineHeight: '1.6', 
      fontStyle: 'italic',
      margin: 0
    }}>
      "{path.welcomeMessage}"
    </p>
  </div>
)}
```

- [ ] **Step 2: Commit Frontend changes**
```bash
git add apps/web/src/pages/SubjectPage.tsx
git commit -m "feat(web): display welcomeMessage in SubjectPage"
```

### Task 5: End-to-End Verification

- [ ] **Step 1: Trigger a new path generation**
Verify the UI displays the sparkle icon and the italicized welcome message.

- [ ] **Step 2: Verify database persistence**
Verify the column is populated in the database.
```bash
git status
```
Confirm everything is committed and ready.
