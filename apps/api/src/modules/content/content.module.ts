import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { AgentsModule } from '../agents/agents.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'content-generation' }),
    AgentsModule,
  ],
  controllers: [ContentController],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}
