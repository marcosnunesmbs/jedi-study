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

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        submissions: {
          orderBy: { attempt: 'desc' },
          take: 1,
          include: { analysis: true },
        },
      },
    });

    if (!task) throw new NotFoundException('Task not found');

    // Parse analysis JSON if it exists
    if (task.submissions[0]?.analysis) {
      const a = task.submissions[0].analysis;
      (task.submissions[0].analysis as any).strengths = typeof a.strengths === 'string' ? JSON.parse(a.strengths || '[]') : a.strengths;
      (task.submissions[0].analysis as any).improvements = typeof a.improvements === 'string' ? JSON.parse(a.improvements || '[]') : a.improvements;
    }

    return task;
  }

  async submit(taskId: string, content: string, contentType: string = 'TEXT') {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { phase: true },
    });
    if (!task) throw new NotFoundException('Task not found');

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

  async getSubmissionStatus(submissionId: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      select: { id: true, status: true, score: true, passed: true },
    });

    if (!submission) throw new NotFoundException('Submission not found');

    const job = await this.prisma.agentJob.findFirst({
      where: { referenceId: submissionId },
      orderBy: { createdAt: 'desc' },
    });

    return { ...submission, job };
  }

  async getAnalysis(submissionId: string) {
    const analysis = await this.prisma.analysis.findUnique({
      where: { submissionId },
      include: {
        submission: {
          select: { taskId: true, attempt: true, status: true },
        },
      },
    });

    if (!analysis) throw new NotFoundException('Analysis not found');

    return {
      ...analysis,
      strengths: JSON.parse(analysis.strengths || '[]'),
      improvements: JSON.parse(analysis.improvements || '[]'),
    };
  }
}
