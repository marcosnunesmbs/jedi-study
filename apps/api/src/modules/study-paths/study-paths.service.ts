import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudyPath } from '../../database/entities/study-path.entity';
import { Subject } from '../../database/entities/subject.entity';
import { AgentJob } from '../../database/entities/agent-job.entity';
import { SafetyService } from '../agents/safety.service';

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
    private readonly safety: SafetyService,
  ) {}

  async generate(subjectId: string, userId: string) {
    const subject = await this.subjectRepository.findOne({
      where: { id: subjectId, userId },
    });
    if (!subject) throw new NotFoundException('Subject not found');

    // Safety and Budget Validation
    await this.safety.validateInput(userId, subject.title);

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

    try {
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
    } catch (error) {
      await this.studyPathRepository.update(
        { id: studyPath.id },
        { status: 'ARCHIVED' },
      );
      throw error;
    }
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

    // Trigger recovery if stuck
    if (path.status === 'GENERATING') {
      await this.ensureAgentJob(id);
    }

    const job = await this.agentJobRepository.findOne({
      where: { referenceId: id, type: 'PATH_GENERATOR' },
      order: { createdAt: 'DESC' },
    });

    return { ...path, job };
  }

  /**
   * Recovers stuck StudyPath generation
   */
  async ensureAgentJob(id: string) {
    const path = await this.studyPathRepository.findOne({
      where: { id },
      relations: ['subject'],
    });

    if (!path || path.status !== 'GENERATING') return;

    const agentJob = await this.agentJobRepository.findOne({
      where: { referenceId: id, type: 'PATH_GENERATOR' },
    });

    if (agentJob) return;

    // Re-enqueue using subject data
    try {
      const job = await this.pathQueue.add(
        'generate',
        {
          studyPathId: path.id,
          subjectId: path.subjectId,
          userId: path.userId,
          subjectTitle: path.subject.title,
          skillLevel: path.subject.skillLevel,
          goals: JSON.parse(path.subject.goals || '[]'),
        },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          timeout: 120000,
        },
      );

      const newAgentJob = this.agentJobRepository.create({
        bullJobId: `path-generation:${job.id}`,
        type: 'PATH_GENERATOR',
        status: 'QUEUED',
        referenceId: path.id,
      });
      await this.agentJobRepository.save(newAgentJob);
    } catch (error) {
      await this.studyPathRepository.update({ id }, { status: 'ARCHIVED' });
    }
  }
}
