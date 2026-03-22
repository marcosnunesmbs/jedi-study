import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../../database/entities/task.entity';
import { Submission } from '../../database/entities/submission.entity';
import { Analysis } from '../../database/entities/analysis.entity';
import { AgentJob } from '../../database/entities/agent-job.entity';
import { SafetyService } from '../agents/safety.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
    @InjectRepository(Analysis)
    private readonly analysisRepository: Repository<Analysis>,
    @InjectRepository(AgentJob)
    private readonly agentJobRepository: Repository<AgentJob>,
    @InjectQueue('task-analysis') private readonly analysisQueue: Queue,
    private readonly safety: SafetyService,
  ) {}

  async findOne(id: string, userId: string) {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['phase', 'phase.studyPath', 'submissions', 'submissions.analysis'],
      order: {
        submissions: { attempt: 'DESC' },
      },
    });

    if (!task || task.phase.studyPath.userId !== userId) throw new NotFoundException('Task not found');

    // Pick only the latest submission to match prisma behavior
    const latestSubmission = task.submissions[0];
    const taskWithLatest = {
      ...task,
      submissions: latestSubmission ? [latestSubmission] : [],
    };

    // Parse analysis JSON if it exists
    if (latestSubmission?.analysis) {
      const a = latestSubmission.analysis;
      (latestSubmission.analysis as any).strengths = typeof a.strengths === 'string' ? JSON.parse(a.strengths || '[]') : a.strengths;
      (latestSubmission.analysis as any).improvements = typeof a.improvements === 'string' ? JSON.parse(a.improvements || '[]') : a.improvements;
    }

    delete (taskWithLatest.phase as any).studyPath;

    return taskWithLatest;
  }

  async submit(taskId: string, content: string, contentType: string = 'TEXT', userId: string) {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ['phase', 'phase.studyPath'],
    });
    if (!task || task.phase.studyPath.userId !== userId) throw new NotFoundException('Task not found');

    // Safety and Budget Validation
    await this.safety.validateInput(userId, content);

    const lastSubmission = await this.submissionRepository.findOne({
      where: { taskId },
      order: { attempt: 'DESC' },
    });

    const attempt = (lastSubmission?.attempt || 0) + 1;

    const submission = this.submissionRepository.create({
      taskId,
      attempt,
      content,
      contentType,
      status: 'PENDING',
    });
    await this.submissionRepository.save(submission);

    await this.taskRepository.update(
      { id: taskId },
      { status: 'SUBMITTED' },
    );

    try {
      const job = await this.analysisQueue.add(
        'analyze',
        {
          submissionId: submission.id,
          userId: task.phase.studyPath.userId,
          taskId: task.id,
          phaseId: task.phaseId,
          studyPathId: task.phase.studyPathId,
          phaseOrder: task.phase.order,
          taskTitle: task.title,
          taskDescription: task.description,
          taskType: task.type,
          submissionContent: content,
          taskPrompt: task.prompt || undefined,
          expectedResponseFormat: task.expectedResponseFormat || undefined,
          evaluationCriteria: task.evaluationCriteria
            ? JSON.parse(task.evaluationCriteria)
            : undefined,
        },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          timeout: 90000,
        },
      );

      const agentJob = this.agentJobRepository.create({
        bullJobId: `task-analysis:${job.id}`,
        type: 'TASK_ANALYZER',
        status: 'QUEUED',
        referenceId: submission.id,
      });
      await this.agentJobRepository.save(agentJob);

      return { submissionId: submission.id, jobId: String(job.id) };
    } catch (error) {
      await this.submissionRepository.update(
        { id: submission.id },
        { status: 'ERROR' },
      );
      throw error;
    }
  }

  async getSubmissionStatus(submissionId: string, userId: string) {
    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId },
      relations: ['task', 'task.phase', 'task.phase.studyPath'],
    });

    if (!submission || submission.task.phase.studyPath.userId !== userId) {
      throw new NotFoundException('Submission not found');
    }

    // Trigger recovery if stuck
    if (submission.status === 'PENDING') {
      await this.ensureAgentJob(submissionId);
    }

    const job = await this.agentJobRepository.findOne({
      where: { referenceId: submissionId },
      order: { createdAt: 'DESC' },
    });

    return { id: submission.id, status: submission.status, score: submission.score, passed: submission.passed, job };
  }

  /**
   * Recovers stuck task submissions
   */
  async ensureAgentJob(id: string) {
    const submission = await this.submissionRepository.findOne({
      where: { id },
      relations: ['task', 'task.phase', 'task.phase.studyPath'],
    });

    if (!submission || submission.status !== 'PENDING') return;

    const agentJob = await this.agentJobRepository.findOne({
      where: { referenceId: id },
    });

    if (agentJob) return;

    const task = submission.task;
    
    // Re-enqueue using submission and task data
    try {
      const job = await this.analysisQueue.add(
        'analyze',
        {
          submissionId: submission.id,
          userId: task.phase.studyPath.userId,
          taskId: task.id,
          phaseId: task.phaseId,
          studyPathId: task.phase.studyPathId,
          phaseOrder: task.phase.order,
          taskTitle: task.title,
          taskDescription: task.description,
          taskType: task.type,
          submissionContent: submission.content,
          taskPrompt: task.prompt,
          expectedResponseFormat: task.expectedResponseFormat,
          evaluationCriteria: task.evaluationCriteria
            ? JSON.parse(task.evaluationCriteria)
            : undefined,
        },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          timeout: 90000,
        },
      );

      const newAgentJob = this.agentJobRepository.create({
        bullJobId: `task-analysis:${job.id}`,
        type: 'TASK_ANALYZER',
        status: 'QUEUED',
        referenceId: submission.id,
      });
      await this.agentJobRepository.save(newAgentJob);
    } catch (error) {
      await this.submissionRepository.update({ id }, { status: 'ERROR' });
    }
  }

  async getAnalysis(submissionId: string, userId: string) {
    const analysis = await this.analysisRepository.findOne({
      where: { submissionId },
      relations: ['submission', 'submission.task', 'submission.task.phase', 'submission.task.phase.studyPath'],
    });

    if (!analysis || analysis.submission.task.phase.studyPath.userId !== userId) {
      throw new NotFoundException('Analysis not found');
    }

    return {
      id: analysis.id,
      submissionId: analysis.submissionId,
      agentType: analysis.agentType,
      feedback: analysis.feedback,
      score: analysis.score,
      passed: analysis.passed,
      rawOutput: analysis.rawOutput,
      createdAt: analysis.createdAt,
      strengths: typeof analysis.strengths === 'string' ? JSON.parse(analysis.strengths || '[]') : analysis.strengths,
      improvements: typeof analysis.improvements === 'string' ? JSON.parse(analysis.improvements || '[]') : analysis.improvements,
      submission: {
        taskId: analysis.submission.taskId,
        attempt: analysis.submission.attempt,
        status: analysis.submission.status
      }
    };
  }
}
