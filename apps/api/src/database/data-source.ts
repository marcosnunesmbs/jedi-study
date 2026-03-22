import 'dotenv/config';
import { join } from 'path';
import { DataSource } from 'typeorm';
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
import { ModelPrice } from './entities/model-price.entity';
import { AgentModelConfig } from './entities/agent-model-config.entity';

const isTs = __filename.endsWith('.ts');

export const AppDataSource = new DataSource({
  type: 'mysql',
  url: process.env.DATABASE_URL,
  entities: [
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
    ModelPrice,
    AgentModelConfig,
  ],
  migrations: [join(__dirname, 'migrations', isTs ? '*.ts' : '*.js')],
  synchronize: false,
});
