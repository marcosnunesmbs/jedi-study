import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PhasesService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string, userId: string) {
    const phase = await this.prisma.phase.findUnique({
      where: { id },
      include: {
        studyPath: { select: { userId: true } },
        tasks: { orderBy: { order: 'asc' } },
        contents: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!phase || phase.studyPath.userId !== userId) {
      throw new NotFoundException('Phase not found');
    }
    
    // Remove the studyPath object before returning if we don't want to leak it, 
    // but returning it is fine as it just has userId. We'll leave it or delete it.
    delete (phase as any).studyPath;

    return phase;
  }

  async tryUnlockNext(studyPathId: string, completedPhaseOrder: number) {
    const nextPhase = await this.prisma.phase.findFirst({
      where: { studyPathId, order: completedPhaseOrder + 1 },
    });

    if (nextPhase && nextPhase.status === 'LOCKED') {
      await this.prisma.phase.update({
        where: { id: nextPhase.id },
        data: { status: 'ACTIVE' },
      });

      // Check if all phases are complete
      const allPhases = await this.prisma.phase.findMany({
        where: { studyPathId },
        select: { status: true },
      });

      const allDone = allPhases.every((p) => p.status === 'COMPLETED');
      if (allDone) {
        await this.prisma.studyPath.update({
          where: { id: studyPathId },
          data: { status: 'ARCHIVED' },
        });
      }
    }
  }

  async markCompleted(id: string) {
    return this.prisma.phase.update({
      where: { id },
      data: { status: 'COMPLETED' },
    });
  }
}
