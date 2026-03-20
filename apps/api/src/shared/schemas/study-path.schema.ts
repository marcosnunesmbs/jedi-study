import { z } from 'zod';

export const TaskTypeSchema = z.enum(['READING', 'EXERCISE', 'PROJECT', 'QUIZ']);
export const SkillLevelSchema = z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']);

export const ProjectContextSchema = z.object({
  deliverables: z.array(z.string()),
  evaluationCriteria: z.array(z.string()),
  suggestedTechStack: z.array(z.string()),
});

export const PathTaskSchema = z.object({
  order: z.number().int().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  type: TaskTypeSchema,
  maxScore: z.number().int().min(0).max(100).default(100),
  projectContext: ProjectContextSchema.nullable().optional(),
});

export const PathPhaseSchema = z.object({
  order: z.number().int().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  objectives: z.array(z.string().min(1)).min(1),
  topics: z.array(z.string().min(1)).min(1),
  estimatedHours: z.number().int().min(1),
  tasks: z.array(PathTaskSchema).min(1),
});

export const StudyPathOutputSchema = z.object({
  subject: z.string().min(1),
  welcomeMessage: z.string().optional().default(''),
  skillLevel: SkillLevelSchema,
  estimatedHours: z.number().int().min(1),
  totalPhases: z.number().int().min(1),
  phases: z.array(PathPhaseSchema).min(1),
});

export type StudyPathOutput = z.infer<typeof StudyPathOutputSchema>;
export type PathPhase = z.infer<typeof PathPhaseSchema>;
export type PathTask = z.infer<typeof PathTaskSchema>;
export type ProjectContext = z.infer<typeof ProjectContextSchema>;
export type TaskType = z.infer<typeof TaskTypeSchema>;
export type SkillLevel = z.infer<typeof SkillLevelSchema>;
