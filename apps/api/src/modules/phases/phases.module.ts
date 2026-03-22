import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { PhasesService } from './phases.service';
import { PhasesController } from './phases.controller';
import { Phase } from '../../database/entities/phase.entity';
import { StudyPath } from '../../database/entities/study-path.entity';
import { AgentJob } from '../../database/entities/agent-job.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Phase, StudyPath, AgentJob]),
    BullModule.registerQueue({ name: 'task-generation' }),
  ],
  controllers: [PhasesController],
  providers: [PhasesService],
  exports: [PhasesService],
})
export class PhasesModule {}
