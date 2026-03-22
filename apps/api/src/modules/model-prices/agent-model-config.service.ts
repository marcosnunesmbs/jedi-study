import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentModelConfig, AgentType } from '../../database/entities/agent-model-config.entity';
import { ModelPricesService } from './model-prices.service';

@Injectable()
export class AgentModelConfigService {
  constructor(
    @InjectRepository(AgentModelConfig)
    private readonly agentModelConfigRepository: Repository<AgentModelConfig>,
    private readonly modelPricesService: ModelPricesService,
  ) {}

  async create(data: {
    agentType: AgentType;
    modelPriceId: string;
    isActive?: boolean;
  }) {
    const existing = await this.agentModelConfigRepository.findOne({ where: { agentType: data.agentType } });
    if (existing) {
      throw new ConflictException(`Config for agent type "${data.agentType}" already exists`);
    }

    await this.modelPricesService.findOne(data.modelPriceId);

    const config = this.agentModelConfigRepository.create(data);
    return this.agentModelConfigRepository.save(config);
  }

  async findAll() {
    return this.agentModelConfigRepository.find({
      relations: ['modelPrice'],
      order: { agentType: 'ASC' },
    });
  }

  async findOne(id: string) {
    const config = await this.agentModelConfigRepository.findOne({
      where: { id },
      relations: ['modelPrice'],
    });
    if (!config) {
      throw new NotFoundException(`AgentModelConfig with id "${id}" not found`);
    }
    return config;
  }

  async findByAgentType(agentType: AgentType) {
    return this.agentModelConfigRepository.findOne({
      where: { agentType, isActive: true },
      relations: ['modelPrice'],
    });
  }

  async update(id: string, data: Partial<{
    modelPriceId: string;
    isActive: boolean;
  }>) {
    await this.findOne(id);
    
    if (data.modelPriceId) {
      await this.modelPricesService.findOne(data.modelPriceId);
    }
    
    await this.agentModelConfigRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.agentModelConfigRepository.delete(id);
    return { success: true };
  }

  async seedDefaultConfigs() {
    const defaultConfigs = [
      { agentType: AgentType.CONTENT_GEN, modelName: 'gemini-2.5-flash-lite-preview' },
      { agentType: AgentType.PATH_GENERATOR, modelName: 'gemini-1.5-pro' },
      { agentType: AgentType.TASK_ANALYZER, modelName: 'gemini-1.5-flash' },
      { agentType: AgentType.PROJECT_ANALYZER, modelName: 'gemini-1.5-flash' },
      { agentType: AgentType.SAFETY, modelName: 'gemini-2.5-flash-lite-preview' },
    ];

    const results = [];
    for (const config of defaultConfigs) {
      const existing = await this.agentModelConfigRepository.findOne({ where: { agentType: config.agentType } });
      if (!existing) {
        const modelPrice = await this.modelPricesService.findByName(config.modelName);
        if (modelPrice) {
          const agentConfig = this.agentModelConfigRepository.create({
            agentType: config.agentType,
            modelPriceId: modelPrice.id,
            isActive: true,
          });
          results.push(await this.agentModelConfigRepository.save(agentConfig));
        }
      }
    }
    return results;
  }
}