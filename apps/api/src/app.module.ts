import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
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
import { InitializationService } from './common/services/initialization.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        url: config.get('database.url'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: config.get('redis.url'),
      }),
    }),
    DatabaseModule,
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
    InitializationService,
  ],
})
export class AppModule {}
