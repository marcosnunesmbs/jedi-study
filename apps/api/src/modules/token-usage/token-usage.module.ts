import { Module } from '@nestjs/common';
import { TokenUsageService } from './token-usage.service';
import { TokenUsageController } from './token-usage.controller';

@Module({
  controllers: [TokenUsageController],
  providers: [TokenUsageService],
  exports: [TokenUsageService],
})
export class TokenUsageModule {}
