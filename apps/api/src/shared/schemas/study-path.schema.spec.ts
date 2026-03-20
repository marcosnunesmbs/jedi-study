import { StudyPathOutputSchema } from './study-path.schema';

describe('StudyPathOutputSchema', () => {
  it('should use default empty string for missing welcomeMessage', () => {
    const data = {
      subject: 'Test',
      skillLevel: 'BEGINNER' as const,
      estimatedHours: 10,
      totalPhases: 1,
      phases: [
        {
          order: 1,
          title: 'Phase 1',
          description: 'Desc',
          objectives: ['Obj'],
          topics: ['Topic'],
          estimatedHours: 10,
          tasks: [
            {
              order: 1,
              title: 'Task 1',
              description: 'Desc',
              type: 'READING' as const,
              maxScore: 100
            }
          ]
        }
      ]
    };
    const result = StudyPathOutputSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.welcomeMessage).toBe('');
    }
  });

  it('should accept provided welcomeMessage', () => {
    const data = {
      subject: 'Test',
      welcomeMessage: 'Hello!',
      skillLevel: 'BEGINNER' as const,
      estimatedHours: 10,
      totalPhases: 1,
      phases: [
        {
          order: 1,
          title: 'Phase 1',
          description: 'Desc',
          objectives: ['Obj'],
          topics: ['Topic'],
          estimatedHours: 10,
          tasks: [
            {
              order: 1,
              title: 'Task 1',
              description: 'Desc',
              type: 'READING' as const,
              maxScore: 100
            }
          ]
        }
      ]
    };
    const result = StudyPathOutputSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.welcomeMessage).toBe('Hello!');
    }
  });
});
