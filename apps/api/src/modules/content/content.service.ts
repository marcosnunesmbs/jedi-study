import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ContentService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('content-generation') private readonly contentQueue: Queue,
  ) {}

  async generateForPhase(phaseId: string, contentType: string = 'EXPLANATION', customPrompt?: string, userId?: string, topic?: string) {
    const phase = await this.prisma.phase.findUnique({ 
      where: { id: phaseId },
      include: { studyPath: { select: { userId: true } } }
    });
    
    if (!phase || (userId && phase.studyPath.userId !== userId)) {
      throw new NotFoundException('Phase not found');
    }

    const contentTitle = topic 
      ? `${contentType} — ${topic}`
      : customPrompt 
        ? `Custom: ${customPrompt.replace(/\n/g, ' ').slice(0, 120)}${customPrompt.length > 120 ? '...' : ''}` 
        : `${contentType} — ${phase.title}`;

    const content = await this.prisma.content.create({
      data: {
        phaseId,
        topic,
        type: contentType,
        title: contentTitle,
        body: '',
        status: 'PENDING',
      },
    });

    const job = await this.contentQueue.add(
      'generate',
      {
        contentId: content.id,
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

    await this.prisma.content.update({
      where: { id: content.id },
      data: { jobId: String(job.id) },
    });

    await this.prisma.agentJob.create({
      data: {
        bullJobId: `content-generation:${job.id}`,
        type: 'CONTENT_GEN',
        status: 'QUEUED',
        referenceId: content.id,
      },
    });

    return { contentId: content.id, jobId: String(job.id) };
  }

  async findOne(id: string, userId: string) {
    const content = await this.prisma.content.findUnique({ 
      where: { id },
      include: { phase: { include: { studyPath: { select: { userId: true } } } } }
    });

    if (!content || content.phase.studyPath.userId !== userId) {
      throw new NotFoundException('Content not found');
    }

    delete (content.phase as any).studyPath;

    return content;
  }
}
