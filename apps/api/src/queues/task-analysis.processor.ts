import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { AgentsService } from '../modules/agents/agents.service';
import { TokenUsageService } from '../modules/token-usage/token-usage.service';
import { PhasesService } from '../modules/phases/phases.service';

interface TaskAnalysisJob {
  submissionId: string;
  taskId: string;
  phaseId: string;
  studyPathId: string;
  phaseOrder: number;
  taskTitle: string;
  taskDescription: string;
  taskType: string;
  submissionContent: string;
  projectContext?: Record<string, unknown>;
}

@Processor('task-analysis')
export class TaskAnalysisProcessor {
  private readonly logger = new Logger(TaskAnalysisProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly agents: AgentsService,
    private readonly tokenUsage: TokenUsageService,
    private readonly phases: PhasesService,
  ) {}

  @Process('analyze')
  async handleAnalyze(job: Job<TaskAnalysisJob>) {
    const {
      submissionId, taskId, phaseId, studyPathId, phaseOrder,
      taskTitle, taskDescription, taskType, submissionContent, projectContext,
    } = job.data;

    this.logger.log(`Analyzing submission=${submissionId}`);

    await this.prisma.submission.update({
      where: { id: submissionId },
      data: { status: 'ANALYZING' },
    });

    await this.prisma.agentJob.updateMany({
      where: { referenceId: submissionId },
      data: { status: 'PROCESSING', startedAt: new Date() },
    });

    try {
      const agentType = taskType === 'PROJECT' ? 'PROJECT_ANALYZER' : 'TASK_ANALYZER';

      const response = await this.agents.analyzeTask({
        taskTitle,
        taskDescription,
        taskType,
        submissionContent,
        projectContext,
      });

      // Record token usage
      await this.tokenUsage.record({
        agentType,
        referenceId: submissionId,
        referenceType: 'Submission',
        usage: response.usage,
      });

      const result = response.data as any;

      // Persist analysis
      await this.prisma.analysis.create({
        data: {
          submissionId,
          agentType,
          feedback: result.feedback,
          strengths: JSON.stringify(result.strengths || []),
          improvements: JSON.stringify(result.improvements || []),
          score: result.score,
          passed: result.passed,
          rawOutput: JSON.stringify(result),
        },
      });

      // Update submission
      await this.prisma.submission.update({
        where: { id: submissionId },
        data: {
          status: 'COMPLETE',
          score: result.score,
          passed: result.passed,
        },
      });

      // Update task status
      await this.prisma.task.update({
        where: { id: taskId },
        data: { status: result.passed ? 'PASSED' : 'FAILED' },
      });

      await this.prisma.agentJob.updateMany({
        where: { referenceId: submissionId },
        data: { status: 'COMPLETE', completedAt: new Date() },
      });

      // Check if all tasks in phase are passed — unlock next phase
      if (result.passed) {
        const allTasks = await this.prisma.task.findMany({
          where: { phaseId },
          select: { status: true },
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

      await this.prisma.submission.update({
        where: { id: submissionId },
        data: { status: 'ERROR' },
      });

      await this.prisma.agentJob.updateMany({
        where: { referenceId: submissionId },
        data: { status: 'FAILED', error: errMsg, completedAt: new Date() },
      });

      throw error;
    }
  }
}
