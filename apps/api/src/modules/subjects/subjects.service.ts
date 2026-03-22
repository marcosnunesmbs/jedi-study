import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from '../../database/entities/subject.entity';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
  ) {}

  async findAll(userId: string) {
    const subjects = await this.subjectRepository.find({
      where: { userId },
      relations: ['studyPaths'],
      order: { createdAt: 'DESC' },
    });

    // Batch-load progress for all subjects with active study paths
    const activePathIds = subjects
      .flatMap(s => s.studyPaths.filter(p => p.isActive))
      .map(p => p.id);

    let progressMap: Record<string, number> = {};
    if (activePathIds.length > 0) {
      const rows: { studyPathId: string; totalTasks: string; passedTasks: string }[] =
        await this.subjectRepository.query(
          `SELECT p.studyPathId,
                  COUNT(t.id) AS totalTasks,
                  SUM(CASE WHEN t.status = 'PASSED' THEN 1 ELSE 0 END) AS passedTasks
           FROM Phase p
           INNER JOIN Task t ON t.phaseId = p.id
           WHERE p.studyPathId IN (${activePathIds.map(() => '?').join(',')})
           GROUP BY p.studyPathId`,
          activePathIds,
        );
      for (const row of rows) {
        const total = parseInt(row.totalTasks, 10);
        const passed = parseInt(row.passedTasks, 10);
        progressMap[row.studyPathId] = total > 0 ? Math.round((passed / total) * 100) : 0;
      }
    }

    return subjects.map(s => {
      const activePath = s.studyPaths.find(p => p.isActive);
      return {
        ...s,
        progress: activePath ? (progressMap[activePath.id] ?? 0) : 0,
        studyPaths: s.studyPaths.filter(p => p.isActive).map(p => ({
          id: p.id,
          status: p.status,
          totalPhases: p.totalPhases,
          version: p.version,
        })),
      };
    });
  }

  async findOne(id: string, userId: string) {
    const subject = await this.subjectRepository.findOne({
      where: { id, userId },
      relations: ['studyPaths', 'studyPaths.phases'],
      order: {
        studyPaths: {
          phases: {
            order: 'ASC',
          },
        },
      },
    });

    if (!subject) throw new NotFoundException('Subject not found');

    // Manually filter active paths and pick only needed phase fields to match prisma select
    return {
      ...subject,
      studyPaths: subject.studyPaths.filter(p => p.isActive).map(p => ({
        ...p,
        phases: p.phases.map(ph => ({
          id: ph.id,
          order: ph.order,
          title: ph.title,
          status: ph.status,
          estimatedHours: ph.estimatedHours,
        }))
      }))
    };
  }

  async create(userId: string, data: {
    title: string;
    description?: string;
    skillLevel?: string;
    goals?: string[];
  }) {
    const subject = this.subjectRepository.create({
      userId,
      title: data.title,
      description: data.description,
      skillLevel: data.skillLevel || 'BEGINNER',
      goals: JSON.stringify(data.goals || []),
    });
    return this.subjectRepository.save(subject);
  }

  async update(id: string, userId: string, data: {
    title?: string;
    description?: string;
    skillLevel?: string;
    goals?: string[];
  }) {
    const subject = await this.subjectRepository.findOne({ where: { id, userId } });
    if (!subject) throw new NotFoundException('Subject not found');

    if (data.title !== undefined) subject.title = data.title;
    if (data.description !== undefined) subject.description = data.description;
    if (data.skillLevel !== undefined) subject.skillLevel = data.skillLevel;
    if (data.goals !== undefined) subject.goals = JSON.stringify(data.goals);

    return this.subjectRepository.save(subject);
  }

  async delete(id: string, userId: string) {
    const subject = await this.subjectRepository.findOne({ where: { id, userId } });
    if (!subject) throw new NotFoundException('Subject not found');
    return this.subjectRepository.remove(subject);
  }
}
