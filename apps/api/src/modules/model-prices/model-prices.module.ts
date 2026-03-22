import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModelPrice } from '../../database/entities/model-price.entity';
import { AgentModelConfig } from '../../database/entities/agent-model-config.entity';
import { ModelPricesService } from './model-prices.service';
import { AgentModelConfigService } from './agent-model-config.service';
import { ModelPricesController } from './model-prices.controller';
import { AgentModelConfigController } from './agent-model-config.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ModelPrice, AgentModelConfig])],
  controllers: [ModelPricesController, AgentModelConfigController],
  providers: [ModelPricesService, AgentModelConfigService],
  exports: [ModelPricesService, AgentModelConfigService],
})
export class ModelPricesModule {}