import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../../database/entities/task.entity';
import { Submission } from '../../database/entities/submission.entity';
import { Analysis } from '../../database/entities/analysis.entity';
import { AgentJob } from '../../database/entities/agent-job.entity';

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
        projectContext: task.projectContext
          ? JSON.parse(task.projectContext)
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
      type: task.type === 'PROJECT' ? 'PROJECT_ANALYZER' : 'TASK_ANALYZER',
      status: 'QUEUED',
      referenceId: submission.id,
    });
    await this.agentJobRepository.save(agentJob);

    return { submissionId: submission.id, jobId: String(job.id) };
  }

  async getSubmissionStatus(submissionId: string, userId: string) {
    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId },
      relations: ['task', 'task.phase', 'task.phase.studyPath'],
    });

    if (!submission || submission.task.phase.studyPath.userId !== userId) {
      throw new NotFoundException('Submission not found');
    }

    const job = await this.agentJobRepository.findOne({
      where: { referenceId: submissionId },
      order: { createdAt: 'DESC' },
    });

    return { id: submission.id, status: submission.status, score: submission.score, passed: submission.passed, job };
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
