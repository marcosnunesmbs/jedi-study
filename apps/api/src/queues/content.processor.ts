import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Content } from '../database/entities/content.entity';
import { AgentJob } from '../database/entities/agent-job.entity';
import { AgentsService } from '../modules/agents/agents.service';
import { TokenUsageService } from '../modules/token-usage/token-usage.service';

interface ContentGenerationJob {
  contentId: string;
  userId: string;
  phaseId: string;
  phaseTitle: string;
  phaseObjectives: string[];
  contentType: string;
  customPrompt?: string;
  topic?: string;
}

@Processor('content-generation')
export class ContentProcessor {
  private readonly logger = new Logger(ContentProcessor.name);

  constructor(
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
    @InjectRepository(AgentJob)
    private readonly agentJobRepository: Repository<AgentJob>,
    private readonly agents: AgentsService,
    private readonly tokenUsage: TokenUsageService,
  ) {}

  @Process('generate')
  async handleGenerate(job: Job<ContentGenerationJob>) {
    const { contentId, userId, phaseTitle, phaseObjectives, contentType, customPrompt, topic } = job.data;

    this.logger.log(`Generating content=${contentId}`);

    await this.contentRepository.update(
      { id: contentId },
      { status: 'STREAMING' },
    );

    await this.agentJobRepository.update(
      { referenceId: contentId, type: 'CONTENT_GEN' },
      { status: 'PROCESSING', startedAt: new Date() },
    );

    try {
      const response = await this.agents.generateContent({
        phaseTitle,
        phaseObjectives,
        contentType,
        customPrompt,
        topicTitle: topic,
      });

      // Record token usage
      await this.tokenUsage.record({
        userId,
        agentType: 'CONTENT_GEN',
        referenceId: contentId,
        referenceType: 'Content',
        usage: response.usage,
      });

      await this.contentRepository.update(
        { id: contentId },
        {
          body: response.data as string,
          status: 'COMPLETE',
        },
      );

      await this.agentJobRepository.update(
        { referenceId: contentId, type: 'CONTENT_GEN' },
        { status: 'COMPLETE', completedAt: new Date() },
      );

      this.logger.log(`Content generated for contentId=${contentId}`);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Content generation failed for ${contentId}: ${errMsg}`);

      await this.contentRepository.update(
        { id: contentId },
        { status: 'ERROR' },
      );

      await this.agentJobRepository.update(
        { referenceId: contentId, type: 'CONTENT_GEN' },
        { status: 'FAILED', error: errMsg, completedAt: new Date() },
      );

      throw error;
    }
  }
}
