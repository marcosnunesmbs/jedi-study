import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { BullModule } from '@nestjs/bull';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { StudyPathsModule } from './modules/study-paths/study-paths.module';
import { PhasesModule } from './modules/phases/phases.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { ContentModule } from './modules/content/content.module';
import { AgentsModule } from './modules/agents/agents.module';
import { TokenUsageModule } from './modules/token-usage/token-usage.module';
import { QueuesModule } from './queues/queues.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    BullModule.forRootAsync({
      useFactory: () => ({
        redis: process.env.REDIS_URL || 'redis://localhost:6379',
      }),
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    SubjectsModule,
    StudyPathsModule,
    PhasesModule,
    TasksModule,
    ContentModule,
    AgentsModule,
    TokenUsageModule,
    QueuesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
