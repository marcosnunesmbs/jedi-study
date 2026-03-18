import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Phase } from '../database/entities/phase.entity';
import { Task } from '../database/entities/task.entity';
import { StudyPath } from '../database/entities/study-path.entity';
import { AgentJob } from '../database/entities/agent-job.entity';
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
    private readonly dataSource: DataSource,
    @InjectRepository(AgentJob)
    private readonly agentJobRepository: Repository<AgentJob>,
    @InjectRepository(StudyPath)
    private readonly studyPathRepository: Repository<StudyPath>,
    private readonly agents: AgentsService,
    private readonly tokenUsage: TokenUsageService,
  ) {}

  @Process('generate')
  async handleGenerate(job: Job<PathGenerationJob>) {
    const { studyPathId, userId, subjectTitle, skillLevel, goals, userContext } = job.data;

    this.logger.log(`Generating path for studyPath=${studyPathId}`);

    await this.agentJobRepository.update(
      { referenceId: studyPathId, type: 'PATH_GENERATOR' },
      { status: 'PROCESSING', startedAt: new Date() },
    );

    try {
      const response = await this.agents.generatePath({
        subjectTitle,
        skillLevel,
        goals,
        userContext,
      });

      // Record token usage
      await this.tokenUsage.record({
        userId,
        agentType: 'PATH_GENERATOR',
        referenceId: studyPathId,
        referenceType: 'StudyPath',
        usage: response.usage,
      });

      // Validate output schema
      const parsed = StudyPathOutputSchema.parse(response.data);

      // Hydrate DB in a single transaction
      await this.dataSource.transaction(async (manager) => {
        for (const phaseData of parsed.phases) {
          const phase = manager.create(Phase, {
            studyPathId,
            order: phaseData.order,
            title: phaseData.title,
            description: phaseData.description,
            objectives: JSON.stringify(phaseData.objectives),
            topics: JSON.stringify(phaseData.topics),
            estimatedHours: phaseData.estimatedHours,
            status: phaseData.order === 1 ? 'ACTIVE' : 'LOCKED',
          });
          await manager.save(Phase, phase);

          for (const taskData of phaseData.tasks) {
            const task = manager.create(Task, {
              phaseId: phase.id,
              order: taskData.order,
              title: taskData.title,
              description: taskData.description,
              type: taskData.type,
              maxScore: taskData.maxScore,
              projectContext: taskData.projectContext
                ? JSON.stringify(taskData.projectContext)
                : null,
            });
            await manager.save(Task, task);
          }
        }

        await manager.update(StudyPath, 
          { id: studyPathId },
          {
            status: 'ACTIVE',
            totalPhases: parsed.totalPhases,
            estimatedHours: parsed.estimatedHours,
            rawAgentOutput: JSON.stringify(parsed),
          },
        );
      });

      await this.agentJobRepository.update(
        { referenceId: studyPathId, type: 'PATH_GENERATOR' },
        { status: 'COMPLETE', completedAt: new Date() },
      );

      this.logger.log(`Path generated successfully for studyPath=${studyPathId}`);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Path generation failed for ${studyPathId}: ${errMsg}`);

      await this.studyPathRepository.update(
        { id: studyPathId },
        { status: 'ARCHIVED' },
      );

      await this.agentJobRepository.update(
        { referenceId: studyPathId, type: 'PATH_GENERATOR' },
        { status: 'FAILED', error: errMsg, completedAt: new Date() },
      );

      throw error;
    }
  }
}
