import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.subject.findMany({
      where: { userId },
      include: {
        studyPaths: {
          where: { isActive: true },
          select: { id: true, status: true, totalPhases: true, version: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const subject = await this.prisma.subject.findFirst({
      where: { id, userId },
      include: {
        studyPaths: {
          where: { isActive: true },
          include: {
            phases: {
              select: {
                id: true,
                order: true,
                title: true,
                status: true,
                estimatedHours: true,
              },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!subject) throw new NotFoundException('Subject not found');
    return subject;
  }

  async create(userId: string, data: {
    title: string;
    description?: string;
    skillLevel?: string;
    goals?: string[];
  }) {
    return this.prisma.subject.create({
      data: {
        userId,
        title: data.title,
        description: data.description,
        skillLevel: data.skillLevel || 'BEGINNER',
        goals: JSON.stringify(data.goals || []),
      },
    });
  }

  async delete(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.subject.delete({ where: { id } });
  }
}
