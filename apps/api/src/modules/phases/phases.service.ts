import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PhasesService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string) {
    const phase = await this.prisma.phase.findUnique({
      where: { id },
      include: {
        tasks: { orderBy: { order: 'asc' } },
        contents: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!phase) throw new NotFoundException('Phase not found');
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
