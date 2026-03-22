import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Phase } from '../../database/entities/phase.entity';
import { StudyPath } from '../../database/entities/study-path.entity';
import { AgentJob } from '../../database/entities/agent-job.entity';

@Injectable()
export class PhasesService {
  constructor(
    @InjectRepository(Phase)
    private readonly phaseRepository: Repository<Phase>,
    @InjectRepository(StudyPath)
    private readonly studyPathRepository: Repository<StudyPath>,
    @InjectRepository(AgentJob)
    private readonly agentJobRepository: Repository<AgentJob>,
    @InjectQueue('task-generation')
    private readonly taskGenerationQueue: Queue,
  ) {}

  async findOne(id: string, userId: string) {
    const phase = await this.phaseRepository.findOne({
      where: { id },
      relations: ['studyPath', 'tasks', 'contents'],
      order: {
        tasks: { order: 'ASC' },
        contents: { createdAt: 'DESC' },
      },
    });

    if (!phase || phase.studyPath.userId !== userId) {
      throw new NotFoundException('Phase not found');
    }
    
    // Remove the studyPath object before returning
    delete (phase as any).studyPath;

    if (phase.topics && typeof phase.topics === 'string') {
      try {
        (phase as any).topics = JSON.parse(phase.topics);
      } catch (e) {
        (phase as any).topics = [];
      }
    }

    if (phase.objectives && typeof phase.objectives === 'string') {
      try {
        (phase as any).objectives = JSON.parse(phase.objectives);
      } catch (e) {
        (phase as any).objectives = [];
      }
    }

    return phase;
  }

  async tryUnlockNext(studyPathId: string, completedPhaseOrder: number) {
    const nextPhase = await this.phaseRepository.findOne({
      where: { studyPathId, order: completedPhaseOrder + 1 },
    });

    if (nextPhase && nextPhase.status === 'LOCKED') {
      await this.phaseRepository.update(
        { id: nextPhase.id },
        { status: 'ACTIVE' },
      );

      // Check if all phases are complete
      const allPhases = await this.phaseRepository.find({
        where: { studyPathId },
        select: ['status'],
      });

      const allDone = allPhases.every((p) => p.status === 'COMPLETED');
      if (allDone) {
        await this.studyPathRepository.update(
          { id: studyPathId },
          { status: 'ARCHIVED' },
        );
      }
    }
  }

  async markCompleted(id: string) {
    return this.phaseRepository.update(
      { id },
      { status: 'COMPLETED' },
    );
  }

  async generateTasks(phaseId: string, userId: string) {
    const phase = await this.phaseRepository.findOne({
      where: { id: phaseId },
      relations: ['studyPath', 'tasks', 'contents'],
    });

    if (!phase || phase.studyPath.userId !== userId) {
      throw new NotFoundException('Phase not found');
    }

    if (phase.status !== 'ACTIVE') {
      throw new BadRequestException('Phase must be ACTIVE to generate tasks');
    }

    if (phase.tasks && phase.tasks.length > 0) {
      throw new BadRequestException('Tasks already generated for this phase');
    }

    // Check topic coverage
    const topics: string[] = typeof phase.topics === 'string' ? JSON.parse(phase.topics) : (phase.topics || []);
    const completeContents = (phase.contents || []).filter((c: any) => c.status === 'COMPLETE' && c.topic);
    const coveredTopics = new Set(completeContents.map((c: any) => c.topic));
    const uncoveredTopics = topics.filter((t) => !coveredTopics.has(t));

    if (uncoveredTopics.length > 0) {
      throw new BadRequestException(
        `Missing content for topics: ${uncoveredTopics.join(', ')}`,
      );
    }

    // Enqueue task generation job
    const job = await this.taskGenerationQueue.add(
      'generate',
      {
        phaseId,
        userId,
        studyPathId: phase.studyPathId,
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        timeout: 120000,
      },
    );

    // Create agent job record
    const agentJob = this.agentJobRepository.create({
      bullJobId: `task-generation:${job.id}`,
      type: 'TASK_GENERATOR',
      status: 'QUEUED',
      referenceId: phaseId,
    });
    await this.agentJobRepository.save(agentJob);

    return { jobId: String(job.id) };
  }
}
