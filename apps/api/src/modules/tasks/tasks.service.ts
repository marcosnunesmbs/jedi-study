import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('task-analysis') private readonly analysisQueue: Queue,
  ) {}

  async findOne(id: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        phase: { include: { studyPath: { select: { userId: true } } } },
        submissions: {
          orderBy: { attempt: 'desc' },
          take: 1,
          include: { analysis: true },
        },
      },
    });

    if (!task || task.phase.studyPath.userId !== userId) throw new NotFoundException('Task not found');

    // Parse analysis JSON if it exists
    if (task.submissions[0]?.analysis) {
      const a = task.submissions[0].analysis;
      (task.submissions[0].analysis as any).strengths = typeof a.strengths === 'string' ? JSON.parse(a.strengths || '[]') : a.strengths;
      (task.submissions[0].analysis as any).improvements = typeof a.improvements === 'string' ? JSON.parse(a.improvements || '[]') : a.improvements;
    }

    delete (task.phase as any).studyPath;

    return task;
  }

  async submit(taskId: string, content: string, contentType: string = 'TEXT', userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { phase: { include: { studyPath: { select: { userId: true } } } } },
    });
    if (!task || task.phase.studyPath.userId !== userId) throw new NotFoundException('Task not found');

    const lastSubmission = await this.prisma.submission.findFirst({
      where: { taskId },
      orderBy: { attempt: 'desc' },
    });

    const attempt = (lastSubmission?.attempt || 0) + 1;

    const submission = await this.prisma.submission.create({
      data: {
        taskId,
        attempt,
        content,
        contentType,
        status: 'PENDING',
      },
    });

    await this.prisma.task.update({
      where: { id: taskId },
      data: { status: 'SUBMITTED' },
    });

    const job = await this.analysisQueue.add(
      'analyze',
      {
        submissionId: submission.id,
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

    await this.prisma.agentJob.create({
      data: {
        bullJobId: `task-analysis:${job.id}`,
        type: task.type === 'PROJECT' ? 'PROJECT_ANALYZER' : 'TASK_ANALYZER',
        status: 'QUEUED',
        referenceId: submission.id,
      },
    });

    return { submissionId: submission.id, jobId: String(job.id) };
  }

  async getSubmissionStatus(submissionId: string, userId: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        task: { include: { phase: { include: { studyPath: { select: { userId: true } } } } } }
      }
    });

    if (!submission || submission.task.phase.studyPath.userId !== userId) {
      throw new NotFoundException('Submission not found');
    }

    const job = await this.prisma.agentJob.findFirst({
      where: { referenceId: submissionId },
      orderBy: { createdAt: 'desc' },
    });

    return { id: submission.id, status: submission.status, score: submission.score, passed: submission.passed, job };
  }

  async getAnalysis(submissionId: string, userId: string) {
    const analysis = await this.prisma.analysis.findUnique({
      where: { submissionId },
      include: {
        submission: {
          include: { task: { include: { phase: { include: { studyPath: { select: { userId: true } } } } } } },
        },
      },
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
      strengths: JSON.parse(analysis.strengths || '[]'),
      improvements: JSON.parse(analysis.improvements || '[]'),
      submission: {
        taskId: analysis.submission.taskId,
        attempt: analysis.submission.attempt,
        status: analysis.submission.status
      }
    };
  }
}
