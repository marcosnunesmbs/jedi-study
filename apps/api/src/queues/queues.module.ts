import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { PathGenerationProcessor } from './path-generation.processor';
import { TaskAnalysisProcessor } from './task-analysis.processor';
import { ContentProcessor } from './content.processor';
import { AgentsModule } from '../modules/agents/agents.module';
import { TokenUsageModule } from '../modules/token-usage/token-usage.module';
import { PhasesModule } from '../modules/phases/phases.module';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'path-generation' },
      { name: 'task-analysis' },
      { name: 'content-generation' },
    ),
    AgentsModule,
    TokenUsageModule,
    PhasesModule,
  ],
  providers: [
    PathGenerationProcessor,
    TaskAnalysisProcessor,
    ContentProcessor,
  ],
})
export class QueuesModule {}
