import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { AgentsModule } from '../agents/agents.module';
import { Content } from '../../database/entities/content.entity';
import { Phase } from '../../database/entities/phase.entity';
import { AgentJob } from '../../database/entities/agent-job.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Content, Phase, AgentJob]),
    BullModule.registerQueue({ name: 'content-generation' }),
    AgentsModule,
  ],
  controllers: [ContentController],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}
