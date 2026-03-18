import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AgentsService } from './agents.service';

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
  ],
  providers: [AgentsService],
  exports: [AgentsService],
})
export class AgentsModule {}
