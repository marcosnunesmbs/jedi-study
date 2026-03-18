import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { AgentsService } from '../modules/agents/agents.service';
import { TokenUsageService } from '../modules/token-usage/token-usage.service';

interface ContentGenerationJob {
  contentId: string;
  phaseId: string;
  phaseTitle: string;
  phaseObjectives: string[];
  contentType: string;
  customPrompt?: string;
}

@Processor('content-generation')
export class ContentProcessor {
  private readonly logger = new Logger(ContentProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly agents: AgentsService,
    private readonly tokenUsage: TokenUsageService,
  ) {}

  @Process('generate')
  async handleGenerate(job: Job<ContentGenerationJob>) {
    const { contentId, phaseTitle, phaseObjectives, contentType, customPrompt } = job.data;

    this.logger.log(`Generating content=${contentId}`);

    await this.prisma.content.update({
      where: { id: contentId },
      data: { status: 'STREAMING' },
    });

    await this.prisma.agentJob.updateMany({
      where: { referenceId: contentId, type: 'CONTENT_GEN' },
      data: { status: 'PROCESSING', startedAt: new Date() },
    });

    try {
      const response = await this.agents.generateContent({
        phaseTitle,
        phaseObjectives,
        contentType,
        customPrompt,
      });

      // Record token usage
      await this.tokenUsage.record({
        agentType: 'CONTENT_GEN',
        referenceId: contentId,
        referenceType: 'Content',
        usage: response.usage,
      });

      await this.prisma.content.update({
        where: { id: contentId },
        data: {
          body: response.data as string,
          status: 'COMPLETE',
        },
      });

      await this.prisma.agentJob.updateMany({
        where: { referenceId: contentId, type: 'CONTENT_GEN' },
        data: { status: 'COMPLETE', completedAt: new Date() },
      });

      this.logger.log(`Content generated for contentId=${contentId}`);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Content generation failed for ${contentId}: ${errMsg}`);

      await this.prisma.content.update({
        where: { id: contentId },
        data: { status: 'ERROR' },
      });

      await this.prisma.agentJob.updateMany({
        where: { referenceId: contentId, type: 'CONTENT_GEN' },
        data: { status: 'FAILED', error: errMsg, completedAt: new Date() },
      });

      throw error;
    }
  }
}
