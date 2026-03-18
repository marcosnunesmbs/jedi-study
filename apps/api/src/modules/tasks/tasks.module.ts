import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { AgentsModule } from '../agents/agents.module';
import { PhasesModule } from '../phases/phases.module';
import { Task } from '../../database/entities/task.entity';
import { Submission } from '../../database/entities/submission.entity';
import { Analysis } from '../../database/entities/analysis.entity';
import { AgentJob } from '../../database/entities/agent-job.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Submission, Analysis, AgentJob]),
    BullModule.registerQueue({ name: 'task-analysis' }),
    AgentsModule,
    PhasesModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
