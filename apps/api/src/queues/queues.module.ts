import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { PathGenerationProcessor } from './path-generation.processor';
import { TaskAnalysisProcessor } from './task-analysis.processor';
import { TaskGenerationProcessor } from './task-generation.processor';
import { ContentProcessor } from './content.processor';
import { AgentsModule } from '../modules/agents/agents.module';
import { TokenUsageModule } from '../modules/token-usage/token-usage.module';
import { PhasesModule } from '../modules/phases/phases.module';
import { ModelPricesModule } from '../modules/model-prices/model-prices.module';
import { AgentJob } from '../database/entities/agent-job.entity';
import { StudyPath } from '../database/entities/study-path.entity';
import { Phase } from '../database/entities/phase.entity';
import { Task } from '../database/entities/task.entity';
import { Submission } from '../database/entities/submission.entity';
import { Analysis } from '../database/entities/analysis.entity';
import { Content } from '../database/entities/content.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AgentJob,
      StudyPath,
      Phase,
      Task,
      Submission,
      Analysis,
      Content,
    ]),
    BullModule.registerQueue(
      { name: 'path-generation' },
      { name: 'task-analysis' },
      { name: 'task-generation' },
      { name: 'content-generation' },
    ),
    AgentsModule,
    TokenUsageModule,
    PhasesModule,
    ModelPricesModule,
  ],
  providers: [
    PathGenerationProcessor,
    TaskAnalysisProcessor,
    TaskGenerationProcessor,
    ContentProcessor,
  ],
})
export class QueuesModule {}
