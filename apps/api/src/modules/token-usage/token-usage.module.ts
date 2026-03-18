import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenUsageService } from './token-usage.service';
import { TokenUsageController } from './token-usage.controller';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TokenUsage } from '../../database/entities/token-usage.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TokenUsage])],
  controllers: [TokenUsageController],
  providers: [TokenUsageService, RolesGuard],
  exports: [TokenUsageService],
})
export class TokenUsageModule {}
