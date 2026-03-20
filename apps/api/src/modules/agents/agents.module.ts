import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AgentsService } from './agents.service';
import { SafetyService } from './safety.service';
import { TokenUsageModule } from '../token-usage/token-usage.module';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        baseURL: config.get('agents.baseUrl'),
        timeout: config.get('agents.timeout'),
      }),
      inject: [ConfigService],
    }),
    TokenUsageModule,
  ],
  providers: [AgentsService, SafetyService],
  exports: [AgentsService, SafetyService],
})
export class AgentsModule {}
