import { z } from 'zod';

export const SkillLevelSchema = z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']);

export const PathPhaseSchema = z.object({
  order: z.number().int().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  objectives: z.array(z.string().min(1)).min(1),
  topics: z.array(z.string().min(1)).min(1),
  estimatedHours: z.number().int().min(1),
});

export const StudyPathOutputSchema = z.object({
  subject: z.string().min(1),
  welcomeMessage: z.string().optional().default(''),
  skillLevel: SkillLevelSchema,
  estimatedHours: z.number().int().min(1),
  totalPhases: z.number().int().min(1),
  phases: z.array(PathPhaseSchema).min(1),
});

export const GeneratedTaskTypeSchema = z.enum(['CONCEPTUAL', 'CODE_CHALLENGE', 'ANALYTICAL', 'MULTI_QUESTION']);

export const GeneratedTaskSchema = z.object({
  order: z.number().int().min(1),
  title: z.string().min(1),
  type: GeneratedTaskTypeSchema,
  prompt: z.string().min(1),
  expectedResponseFormat: z.string().min(1),
  evaluationCriteria: z.array(z.string().min(1)).min(1),
  hints: z.array(z.string()).nullable().optional(),
});

export const TaskGenerationOutputSchema = z.object({
  tasks: z.array(GeneratedTaskSchema).min(1),
});

export type StudyPathOutput = z.infer<typeof StudyPathOutputSchema>;
export type PathPhase = z.infer<typeof PathPhaseSchema>;
export type SkillLevel = z.infer<typeof SkillLevelSchema>;
export type GeneratedTask = z.infer<typeof GeneratedTaskSchema>;
export type GeneratedTaskType = z.infer<typeof GeneratedTaskTypeSchema>;
export type TaskGenerationOutput = z.infer<typeof TaskGenerationOutputSchema>;
