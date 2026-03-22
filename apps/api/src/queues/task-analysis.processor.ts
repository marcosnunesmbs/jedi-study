import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from '../database/entities/submission.entity';
import { Analysis } from '../database/entities/analysis.entity';
import { Task } from '../database/entities/task.entity';
import { AgentJob } from '../database/entities/agent-job.entity';
import { AgentType } from '../database/entities/agent-model-config.entity';
import { AgentsService } from '../modules/agents/agents.service';
import { TokenUsageService } from '../modules/token-usage/token-usage.service';
import { AgentModelConfigService } from '../modules/model-prices/agent-model-config.service';
import { PhasesService } from '../modules/phases/phases.service';

interface TaskAnalysisJob {
  submissionId: string;
  userId: string;
  taskId: string;
  phaseId: string;
  studyPathId: string;
  phaseOrder: number;
  taskTitle: string;
  taskDescription: string;
  taskType: string;
  submissionContent: string;
  taskPrompt?: string;
  expectedResponseFormat?: string;
  evaluationCriteria?: string[];
}

@Processor('task-analysis')
export class TaskAnalysisProcessor {
  private readonly logger = new Logger(TaskAnalysisProcessor.name);

  constructor(
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
    @InjectRepository(Analysis)
    private readonly analysisRepository: Repository<Analysis>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(AgentJob)
    private readonly agentJobRepository: Repository<AgentJob>,
    private readonly agents: AgentsService,
    private readonly tokenUsage: TokenUsageService,
    private readonly agentModelConfigService: AgentModelConfigService,
    private readonly phases: PhasesService,
  ) {}

  @Process('analyze')
  async handleAnalyze(job: Job<TaskAnalysisJob>) {
    const {
      submissionId, userId, taskId, phaseId, studyPathId, phaseOrder,
      taskTitle, taskDescription, taskType, submissionContent,
      taskPrompt, expectedResponseFormat, evaluationCriteria,
    } = job.data;

    this.logger.log(`Analyzing submission=${submissionId}`);

    await this.submissionRepository.update(
      { id: submissionId },
      { status: 'ANALYZING' },
    );

    await this.agentJobRepository.update(
      { referenceId: submissionId },
      { status: 'PROCESSING', startedAt: new Date() },
    );

    try {
      const agentType = 'TASK_ANALYZER';

      const modelConfig = await this.agentModelConfigService.findByAgentType(AgentType.TASK_ANALYZER);
      const model = modelConfig?.modelPrice?.name;

      const response = await this.agents.analyzeTask({
        taskTitle,
        taskDescription,
        taskType,
        submissionContent,
        model,
        taskPrompt,
        expectedResponseFormat,
        evaluationCriteria,
      });

      // Record token usage
      await this.tokenUsage.record({
        userId,
        agentType,
        referenceId: submissionId,
        referenceType: 'Submission',
        model,
        usage: response.usage,
      });

      const result = response.data as any;

      // Persist analysis
      const analysis = this.analysisRepository.create({
        submissionId,
        agentType,
        feedback: result.feedback,
        strengths: JSON.stringify(result.strengths || []),
        improvements: JSON.stringify(result.improvements || []),
        score: result.score,
        passed: result.passed,
        rawOutput: JSON.stringify(result),
      });
      await this.analysisRepository.save(analysis);

      // Update submission
      await this.submissionRepository.update(
        { id: submissionId },
        {
          status: 'COMPLETE',
          score: result.score,
          passed: result.passed,
        },
      );

      // Update task status
      await this.taskRepository.update(
        { id: taskId },
        { status: result.passed ? 'PASSED' : 'FAILED' },
      );

      await this.agentJobRepository.update(
        { referenceId: submissionId },
        { status: 'COMPLETE', completedAt: new Date() },
      );

      // Check if all tasks in phase are passed — unlock next phase
      if (result.passed) {
        const allTasks = await this.taskRepository.find({
          where: { phaseId },
          select: ['status'],
        });

        const allPassed = allTasks.every((t) => t.status === 'PASSED');
        if (allPassed) {
          await this.phases.markCompleted(phaseId);
          await this.phases.tryUnlockNext(studyPathId, phaseOrder);
        }
      }

      this.logger.log(
        `Analysis complete for submission=${submissionId}: score=${result.score}, passed=${result.passed}`,
      );
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Analysis failed for ${submissionId}: ${errMsg}`);

      await this.submissionRepository.update(
        { id: submissionId },
        { status: 'ERROR' },
      );

      await this.agentJobRepository.update(
        { referenceId: submissionId },
        { status: 'FAILED', error: errMsg, completedAt: new Date() },
      );

      throw error;
    }
  }
}
