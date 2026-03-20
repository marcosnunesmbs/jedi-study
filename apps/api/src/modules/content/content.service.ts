import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Content } from '../../database/entities/content.entity';
import { Phase } from '../../database/entities/phase.entity';
import { AgentJob } from '../../database/entities/agent-job.entity';
import { SafetyService } from '../agents/safety.service';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
    @InjectRepository(Phase)
    private readonly phaseRepository: Repository<Phase>,
    @InjectRepository(AgentJob)
    private readonly agentJobRepository: Repository<AgentJob>,
    @InjectQueue('content-generation') private readonly contentQueue: Queue,
    private readonly safety: SafetyService,
  ) {}

  async generateForPhase(phaseId: string, contentType: string = 'EXPLANATION', customPrompt?: string, userId?: string, topic?: string) {
    const phase = await this.phaseRepository.findOne({ 
      where: { id: phaseId },
      relations: ['studyPath'],
    });
    
    if (!phase || (userId && phase.studyPath.userId !== userId)) {
      throw new NotFoundException('Phase not found');
    }

    // Safety and Budget Validation
    if (customPrompt || topic) {
      const promptToValidate = customPrompt || topic;
      await this.safety.validateInput(phase.studyPath.userId, promptToValidate);
    }

    const contentTitle = topic 
      ? `${contentType} — ${topic}`
      : customPrompt 
        ? `Custom: ${customPrompt.replace(/\n/g, ' ').slice(0, 120)}${customPrompt.length > 120 ? '...' : ''}` 
        : `${contentType} — ${phase.title}`;

    const content = this.contentRepository.create({
      phaseId,
      topic,
      type: contentType,
      title: contentTitle,
      body: '',
      status: 'PENDING',
      input: JSON.stringify({ contentType, customPrompt, topic }),
    });
    await this.contentRepository.save(content);

    try {
      const job = await this.contentQueue.add(
        'generate',
        {
          contentId: content.id,
          userId: phase.studyPath.userId,
          phaseId,
          phaseTitle: phase.title,
          phaseObjectives: typeof phase.objectives === 'string' ? JSON.parse(phase.objectives || '[]') : phase.objectives,
          contentType,
          customPrompt,
          topic,
        },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          timeout: 60000,
        },
      );

      await this.contentRepository.update(
        { id: content.id },
        { jobId: String(job.id) },
      );

      const agentJob = this.agentJobRepository.create({
        bullJobId: `content-generation:${job.id}`,
        type: 'CONTENT_GEN',
        status: 'QUEUED',
        referenceId: content.id,
      });
      await this.agentJobRepository.save(agentJob);

      return { contentId: content.id, jobId: String(job.id) };
    } catch (error) {
      await this.contentRepository.update(
        { id: content.id },
        { status: 'ERROR' },
      );
      throw error;
    }
  }

  async findOne(id: string, userId: string) {
    const content = await this.contentRepository.findOne({ 
      where: { id },
      relations: ['phase', 'phase.studyPath'],
    });

    if (!content || content.phase.studyPath.userId !== userId) {
      throw new NotFoundException('Content not found');
    }

    delete (content.phase as any).studyPath;

    return content;
  }

  async findById(id: string) {
    return this.contentRepository.findOne({ where: { id } });
  }

  async updateStatus(id: string, status: string) {
    await this.contentRepository.update({ id }, { status });
  }

  async rebuild(id: string, userId: string) {
    const content = await this.findOne(id, userId);
    
    // Reset content state
    await this.contentRepository.update(
      { id },
      { 
        status: 'PENDING', 
        body: '',
        jobId: null,
      }
    );

    // Remove existing agent job to allow fresh re-enqueue
    await this.agentJobRepository.delete({
      referenceId: id,
      type: 'CONTENT_GEN',
    });

    // Trigger immediate re-enqueue
    await this.ensureAgentJob(id);

    return { success: true };
  }

  /**
   * Checks if content is PENDING but without a corresponding AgentJob record.
   * If so, it re-enqueues it. This handles cases where the API or Redis
   * crashed during the initial generation request.
   */
  async ensureAgentJob(id: string) {
    const content = await this.contentRepository.findOne({
      where: { id },
      relations: ['phase', 'phase.studyPath'],
    });

    if (!content || content.status !== 'PENDING') {
      return;
    }

    const agentJob = await this.agentJobRepository.findOne({
      where: { referenceId: id, type: 'CONTENT_GEN' },
    });

    // If job already exists, we don't need to do anything here.
    // BullMQ handles its own retries/backoff.
    if (agentJob) {
      return;
    }

    // Recover generation parameters from the stored 'input' column
    const input = content.input ? JSON.parse(content.input) : {};
    const { contentType = 'EXPLANATION', customPrompt, topic } = input;

    // Gathering phase data again
    const phase = content.phase;
    const phaseObjectives = typeof phase.objectives === 'string' 
      ? JSON.parse(phase.objectives || '[]') 
      : phase.objectives;

    try {
      const job = await this.contentQueue.add(
        'generate',
        {
          contentId: content.id,
          userId: phase.studyPath.userId,
          phaseId: phase.id,
          phaseTitle: phase.title,
          phaseObjectives,
          contentType,
          customPrompt,
          topic,
        },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          timeout: 60000,
        },
      );

      await this.contentRepository.update(
        { id: content.id },
        { jobId: String(job.id) },
      );

      const newAgentJob = this.agentJobRepository.create({
        bullJobId: `content-generation:${job.id}`,
        type: 'CONTENT_GEN',
        status: 'QUEUED',
        referenceId: content.id,
      });
      await this.agentJobRepository.save(newAgentJob);
    } catch (error) {
      // If we can't even enqueue, mark it as error
      await this.contentRepository.update({ id: content.id }, { status: 'ERROR' });
    }
  }
}
