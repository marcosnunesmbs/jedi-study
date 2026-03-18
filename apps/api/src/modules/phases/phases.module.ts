import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhasesService } from './phases.service';
import { PhasesController } from './phases.controller';
import { Phase } from '../../database/entities/phase.entity';
import { StudyPath } from '../../database/entities/study-path.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Phase, StudyPath])],
  controllers: [PhasesController],
  providers: [PhasesService],
  exports: [PhasesService],
})
export class PhasesModule {}
