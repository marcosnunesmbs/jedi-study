import { z } from 'zod';

export const TaskAnalysisOutputSchema = z.object({
  feedback: z.string().min(1),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  score: z.number().int().min(0).max(100),
  passed: z.boolean(),
  suggestions: z.array(z.string()).optional(),
});

export type TaskAnalysisOutput = z.infer<typeof TaskAnalysisOutputSchema>;
