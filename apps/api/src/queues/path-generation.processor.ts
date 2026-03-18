import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { AgentsService } from '../modules/agents/agents.service';
import { TokenUsageService } from '../modules/token-usage/token-usage.service';
import { StudyPathOutputSchema } from '@jedi-study/shared';

interface PathGenerationJob {
  studyPathId: string;
  subjectId: string;
  userId: string;
  subjectTitle: string;
  skillLevel: string;
  goals: string[];
  userContext?: string;
}

@Processor('path-generation')
export class PathGenerationProcessor {
  private readonly logger = new Logger(PathGenerationProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly agents: AgentsService,
    private readonly tokenUsage: TokenUsageService,
  ) {}

  @Process('generate')
  async handleGenerate(job: Job<PathGenerationJob>) {
    const { studyPathId, subjectTitle, skillLevel, goals, userContext } = job.data;

    this.logger.log(`Generating path for studyPath=${studyPathId}`);

    await this.prisma.agentJob.updateMany({
      where: { referenceId: studyPathId, type: 'PATH_GENERATOR' },
      data: { status: 'PROCESSING', startedAt: new Date() },
    });

    try {
      const response = await this.agents.generatePath({
        subjectTitle,
        skillLevel,
        goals,
        userContext,
      });

      // Record token usage
      await this.tokenUsage.record({
        agentType: 'PATH_GENERATOR',
        referenceId: studyPathId,
        referenceType: 'StudyPath',
        usage: response.usage,
      });

      // Validate output schema
      const parsed = StudyPathOutputSchema.parse(response.data);

      // Hydrate DB in a single transaction
      await this.prisma.$transaction(async (tx) => {
        for (const phaseData of parsed.phases) {
          const phase = await tx.phase.create({
            data: {
              studyPathId,
              order: phaseData.order,
              title: phaseData.title,
              description: phaseData.description,
              objectives: JSON.stringify(phaseData.objectives),
              estimatedHours: phaseData.estimatedHours,
              status: phaseData.order === 1 ? 'ACTIVE' : 'LOCKED',
            },
          });

          for (const taskData of phaseData.tasks) {
            await tx.task.create({
              data: {
                phaseId: phase.id,
                order: taskData.order,
                title: taskData.title,
                description: taskData.description,
                type: taskData.type,
                maxScore: taskData.maxScore,
                projectContext: taskData.projectContext
                  ? JSON.stringify(taskData.projectContext)
                  : null,
              },
            });
          }
        }

        await tx.studyPath.update({
          where: { id: studyPathId },
          data: {
            status: 'ACTIVE',
            totalPhases: parsed.totalPhases,
            estimatedHours: parsed.estimatedHours,
            rawAgentOutput: JSON.stringify(parsed),
          },
        });
      });

      await this.prisma.agentJob.updateMany({
        where: { referenceId: studyPathId, type: 'PATH_GENERATOR' },
        data: { status: 'COMPLETE', completedAt: new Date() },
      });

      this.logger.log(`Path generated successfully for studyPath=${studyPathId}`);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Path generation failed for ${studyPathId}: ${errMsg}`);

      await this.prisma.studyPath.update({
        where: { id: studyPathId },
        data: { status: 'ARCHIVED' },
      });

      await this.prisma.agentJob.updateMany({
        where: { referenceId: studyPathId, type: 'PATH_GENERATOR' },
        data: { status: 'FAILED', error: errMsg, completedAt: new Date() },
      });

      throw error;
    }
  }
}
