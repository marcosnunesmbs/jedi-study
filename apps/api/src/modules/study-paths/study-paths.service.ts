import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudyPath } from '../../database/entities/study-path.entity';
import { Subject } from '../../database/entities/subject.entity';
import { AgentJob } from '../../database/entities/agent-job.entity';

@Injectable()
export class StudyPathsService {
  constructor(
    @InjectRepository(StudyPath)
    private readonly studyPathRepository: Repository<StudyPath>,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    @InjectRepository(AgentJob)
    private readonly agentJobRepository: Repository<AgentJob>,
    @InjectQueue('path-generation') private readonly pathQueue: Queue,
  ) {}

  async generate(subjectId: string, userId: string) {
    const subject = await this.subjectRepository.findOne({
      where: { id: subjectId, userId },
    });
    if (!subject) throw new NotFoundException('Subject not found');

    // Archive existing active path
    await this.studyPathRepository.update(
      { subjectId, isActive: true },
      { isActive: false, status: 'ARCHIVED' },
    );

    // Get version number
    const count = await this.studyPathRepository.count({ where: { subjectId } });

    const studyPath = this.studyPathRepository.create({
      subjectId,
      userId,
      version: count + 1,
      status: 'GENERATING',
    });
    await this.studyPathRepository.save(studyPath);

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

    const agentJob = this.agentJobRepository.create({
      bullJobId: `path-generation:${job.id}`,
      type: 'PATH_GENERATOR',
      status: 'QUEUED',
      referenceId: studyPath.id,
    });
    await this.agentJobRepository.save(agentJob);

    return { studyPathId: studyPath.id, jobId: String(job.id) };
  }

  async findActive(subjectId: string, userId: string) {
    const path = await this.studyPathRepository.findOne({
      where: { subjectId, userId, isActive: true },
      relations: ['phases', 'phases.tasks'],
      order: {
        phases: {
          order: 'ASC',
          tasks: {
            order: 'ASC',
          },
        },
      },
    });

    if (!path) throw new NotFoundException('No active study path');
    return path;
  }

  async findById(id: string, userId: string) {
    const path = await this.studyPathRepository.findOne({
      where: { id, userId },
      relations: ['phases', 'phases.tasks'],
      order: {
        phases: {
          order: 'ASC',
          tasks: {
            order: 'ASC',
          },
        },
      },
    });

    if (!path) throw new NotFoundException('Study path not found');
    return path;
  }

  async getStatus(id: string, userId: string) {
    const path = await this.studyPathRepository.findOne({
      where: { id, userId },
      select: ['id', 'status', 'totalPhases', 'version'],
    });

    if (!path) throw new NotFoundException('Study path not found');

    const job = await this.agentJobRepository.findOne({
      where: { referenceId: id, type: 'PATH_GENERATOR' },
      order: { createdAt: 'DESC' },
    });

    return { ...path, job };
  }
}
