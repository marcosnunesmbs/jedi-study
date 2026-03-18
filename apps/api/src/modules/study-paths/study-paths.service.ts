import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StudyPathsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('path-generation') private readonly pathQueue: Queue,
  ) {}

  async generate(subjectId: string, userId: string) {
    const subject = await this.prisma.subject.findFirst({
      where: { id: subjectId, userId },
    });
    if (!subject) throw new NotFoundException('Subject not found');

    // Archive existing active path
    await this.prisma.studyPath.updateMany({
      where: { subjectId, isActive: true },
      data: { isActive: false, status: 'ARCHIVED' },
    });

    // Get version number
    const count = await this.prisma.studyPath.count({ where: { subjectId } });

    const studyPath = await this.prisma.studyPath.create({
      data: {
        subjectId,
        userId,
        version: count + 1,
        status: 'GENERATING',
      },
    });

    const job = await this.pathQueue.add(
      'generate',
      {
        studyPathId: studyPath.id,
        subjectId,
        userId,
        subjectTitle: subject.title,
        skillLevel: subject.skillLevel,
        goals: JSON.parse(subject.goals || '[]'),
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        timeout: 120000,
      },
    );

    await this.prisma.agentJob.create({
      data: {
        bullJobId: `path-generation:${job.id}`,
        type: 'PATH_GENERATOR',
        status: 'QUEUED',
        referenceId: studyPath.id,
      },
    });

    return { studyPathId: studyPath.id, jobId: String(job.id) };
  }

  async findActive(subjectId: string, userId: string) {
    const path = await this.prisma.studyPath.findFirst({
      where: { subjectId, userId, isActive: true },
      include: {
        phases: {
          orderBy: { order: 'asc' },
          include: {
            tasks: {
              orderBy: { order: 'asc' },
              select: {
                id: true, order: true, title: true, type: true, status: true, maxScore: true,
              },
            },
          },
        },
      },
    });

    if (!path) throw new NotFoundException('No active study path');
    return path;
  }

  async findById(id: string, userId: string) {
    const path = await this.prisma.studyPath.findFirst({
      where: { id, userId },
      include: {
        phases: {
          orderBy: { order: 'asc' },
          include: {
            tasks: { orderBy: { order: 'asc' } },
          },
        },
      },
    });

    if (!path) throw new NotFoundException('Study path not found');
    return path;
  }

  async getStatus(id: string, userId: string) {
    const path = await this.prisma.studyPath.findFirst({
      where: { id, userId },
      select: { id: true, status: true, totalPhases: true, version: true },
    });

    if (!path) throw new NotFoundException('Study path not found');

    const job = await this.prisma.agentJob.findFirst({
      where: { referenceId: id, type: 'PATH_GENERATOR' },
      orderBy: { createdAt: 'desc' },
    });

    return { ...path, job };
  }
}
