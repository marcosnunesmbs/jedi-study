import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Phase } from '../database/entities/phase.entity';
import { Task } from '../database/entities/task.entity';
import { Content } from '../database/entities/content.entity';
import { AgentJob } from '../database/entities/agent-job.entity';
import { AgentType } from '../database/entities/agent-model-config.entity';
import { AgentsService } from '../modules/agents/agents.service';
import { TokenUsageService } from '../modules/token-usage/token-usage.service';
import { AgentModelConfigService } from '../modules/model-prices/agent-model-config.service';
import { TaskGenerationOutputSchema } from '../shared';

interface TaskGenerationJob {
  phaseId: string;
  userId: string;
  studyPathId: string;
}

@Processor('task-generation')
export class TaskGenerationProcessor {
  private readonly logger = new Logger(TaskGenerationProcessor.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Phase)
    private readonly phaseRepository: Repository<Phase>,
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
    @InjectRepository(AgentJob)
    private readonly agentJobRepository: Repository<AgentJob>,
    private readonly agents: AgentsService,
    private readonly tokenUsage: TokenUsageService,
    private readonly agentModelConfigService: AgentModelConfigService,
  ) {}

  @Process('generate')
  async handleGenerate(job: Job<TaskGenerationJob>) {
    const { phaseId, userId, studyPathId } = job.data;

    this.logger.log(`Generating tasks for phase=${phaseId}`);

    await this.agentJobRepository.update(
      { referenceId: phaseId, type: 'TASK_GENERATOR' },
      { status: 'PROCESSING', startedAt: new Date() },
    );

    try {
      // Fetch phase with studyPath → subject for skillLevel
      const phase = await this.phaseRepository.findOne({
        where: { id: phaseId },
        relations: ['studyPath', 'studyPath.subject'],
      });

      if (!phase) throw new Error(`Phase ${phaseId} not found`);

      const topics = typeof phase.topics === 'string' ? JSON.parse(phase.topics) : phase.topics;
      const objectives = typeof phase.objectives === 'string' ? JSON.parse(phase.objectives) : phase.objectives;
      const skillLevel = phase.studyPath.subject?.skillLevel || 'INTERMEDIATE';

      // Fetch all COMPLETE contents for this phase
      const contents = await this.contentRepository.find({
        where: { phaseId, status: 'COMPLETE' },
      });

      const contentsPayload = contents.map((c) => ({
        title: c.title || '',
        topic: c.topic || '',
        body: c.body || '',
      }));

      const modelConfig = await this.agentModelConfigService.findByAgentType(AgentType.TASK_GENERATOR);
      const model = modelConfig?.modelPrice?.name;

      const response = await this.agents.generateTasks({
        phaseTitle: phase.title,
        phaseDescription: phase.description,
        topics,
        objectives,
        skillLevel,
        contents: contentsPayload,
        model,
      });

      // Record token usage
      await this.tokenUsage.record({
        userId,
        agentType: 'TASK_GENERATOR',
        referenceId: phaseId,
        referenceType: 'Phase',
        model,
        usage: response.usage,
      });

      // Validate output
      const parsed = TaskGenerationOutputSchema.parse(response.data);

      // Persist tasks in transaction
      await this.dataSource.transaction(async (manager) => {
        for (const taskData of parsed.tasks) {
          const task = manager.create(Task, {
            phaseId,
            order: taskData.order,
            title: taskData.title,
            description: taskData.prompt, // Use prompt as description for backward compat
            type: taskData.type,
            prompt: taskData.prompt,
            expectedResponseFormat: taskData.expectedResponseFormat,
            evaluationCriteria: JSON.stringify(taskData.evaluationCriteria),
            hints: taskData.hints ? JSON.stringify(taskData.hints) : null,
            maxScore: 100,
          });
          await manager.save(Task, task);
        }
      });

      await this.agentJobRepository.update(
        { referenceId: phaseId, type: 'TASK_GENERATOR' },
        { status: 'COMPLETE', completedAt: new Date() },
      );

      this.logger.log(`Tasks generated successfully for phase=${phaseId}`);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Task generation failed for phase=${phaseId}: ${errMsg}`);

      await this.agentJobRepository.update(
        { referenceId: phaseId, type: 'TASK_GENERATOR' },
        { status: 'FAILED', error: errMsg, completedAt: new Date() },
      );

      throw error;
    }
  }
}
