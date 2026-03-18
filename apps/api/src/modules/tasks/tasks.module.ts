import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { AgentsModule } from '../agents/agents.module';
import { PhasesModule } from '../phases/phases.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'task-analysis' }),
    AgentsModule,
    PhasesModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
