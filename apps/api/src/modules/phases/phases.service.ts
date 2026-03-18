import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Phase } from '../../database/entities/phase.entity';
import { StudyPath } from '../../database/entities/study-path.entity';

@Injectable()
export class PhasesService {
  constructor(
    @InjectRepository(Phase)
    private readonly phaseRepository: Repository<Phase>,
    @InjectRepository(StudyPath)
    private readonly studyPathRepository: Repository<StudyPath>,
  ) {}

  async findOne(id: string, userId: string) {
    const phase = await this.phaseRepository.findOne({
      where: { id },
      relations: ['studyPath', 'tasks', 'contents'],
      order: {
        tasks: { order: 'ASC' },
        contents: { createdAt: 'DESC' },
      },
    });

    if (!phase || phase.studyPath.userId !== userId) {
      throw new NotFoundException('Phase not found');
    }
    
    // Remove the studyPath object before returning
    delete (phase as any).studyPath;

    if (phase.topics && typeof phase.topics === 'string') {
      try {
        (phase as any).topics = JSON.parse(phase.topics);
      } catch (e) {
        (phase as any).topics = [];
      }
    }

    if (phase.objectives && typeof phase.objectives === 'string') {
      try {
        (phase as any).objectives = JSON.parse(phase.objectives);
      } catch (e) {
        (phase as any).objectives = [];
      }
    }

    return phase;
  }

  async tryUnlockNext(studyPathId: string, completedPhaseOrder: number) {
    const nextPhase = await this.phaseRepository.findOne({
      where: { studyPathId, order: completedPhaseOrder + 1 },
    });

    if (nextPhase && nextPhase.status === 'LOCKED') {
      await this.phaseRepository.update(
        { id: nextPhase.id },
        { status: 'ACTIVE' },
      );

      // Check if all phases are complete
      const allPhases = await this.phaseRepository.find({
        where: { studyPathId },
        select: ['status'],
      });

      const allDone = allPhases.every((p) => p.status === 'COMPLETED');
      if (allDone) {
        await this.studyPathRepository.update(
          { id: studyPathId },
          { status: 'ARCHIVED' },
        );
      }
    }
  }

  async markCompleted(id: string) {
    return this.phaseRepository.update(
      { id },
      { status: 'COMPLETED' },
    );
  }
}
