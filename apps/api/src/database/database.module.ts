import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Subject } from './entities/subject.entity';
import { StudyPath } from './entities/study-path.entity';
import { Phase } from './entities/phase.entity';
import { Task } from './entities/task.entity';
import { Submission } from './entities/submission.entity';
import { Analysis } from './entities/analysis.entity';
import { Content } from './entities/content.entity';
import { AgentJob } from './entities/agent-job.entity';
import { TokenUsage } from './entities/token-usage.entity';

const entities = [
  User,
  Subject,
  StudyPath,
  Phase,
  Task,
  Submission,
  Analysis,
  Content,
  AgentJob,
  TokenUsage,
];

@Module({
  imports: [TypeOrmModule.forFeature(entities)],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
