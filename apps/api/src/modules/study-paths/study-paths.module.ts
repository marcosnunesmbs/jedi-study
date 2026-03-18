import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { StudyPathsService } from './study-paths.service';
import { StudyPathsController } from './study-paths.controller';
import { AgentsModule } from '../agents/agents.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'path-generation' }),
    AgentsModule,
  ],
  controllers: [StudyPathsController],
  providers: [StudyPathsService],
  exports: [StudyPathsService],
})
export class StudyPathsModule {}
