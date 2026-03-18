import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Content } from '../../database/entities/content.entity';
import { Phase } from '../../database/entities/phase.entity';
import { AgentJob } from '../../database/entities/agent-job.entity';

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
  ) {}

  async generateForPhase(phaseId: string, contentType: string = 'EXPLANATION', customPrompt?: string, userId?: string, topic?: string) {
    const phase = await this.phaseRepository.findOne({ 
      where: { id: phaseId },
      relations: ['studyPath'],
    });
    
    if (!phase || (userId && phase.studyPath.userId !== userId)) {
      throw new NotFoundException('Phase not found');
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
    });
    await this.contentRepository.save(content);

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
}
