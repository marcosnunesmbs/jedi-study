import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { StudyPathsService } from './study-paths.service';
import { StudyPathsController } from './study-paths.controller';
import { AgentsModule } from '../agents/agents.module';
import { StudyPath } from '../../database/entities/study-path.entity';
import { Subject } from '../../database/entities/subject.entity';
import { AgentJob } from '../../database/entities/agent-job.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([StudyPath, Subject, AgentJob]),
    BullModule.registerQueue({ name: 'path-generation' }),
    AgentsModule,
  ],
  controllers: [StudyPathsController],
  providers: [StudyPathsService],
  exports: [StudyPathsService],
})
export class StudyPathsModule {}
