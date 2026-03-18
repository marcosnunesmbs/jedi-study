import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { TokenUsage } from '../../database/entities/token-usage.entity';
import type { TokenUsageInfo } from '@jedi-study/shared';

export interface RecordTokenUsageDto {
  userId: string;
  agentType: string;
  referenceId: string;
  referenceType: string;
  usage: TokenUsageInfo;
}

@Injectable()
export class TokenUsageService {
  constructor(
    @InjectRepository(TokenUsage)
    private readonly tokenUsageRepository: Repository<TokenUsage>,
    private readonly config: ConfigService,
  ) {}

  async record(dto: RecordTokenUsageDto) {
    const costInput1M = this.config.get<number>('gemini.costInput1M') || 0;
    const costOutput1M = this.config.get<number>('gemini.costOutput1M') || 0;

    const inputCost = (dto.usage.inputTokens / 1000000) * costInput1M;
    const outputCost = (dto.usage.outputTokens / 1000000) * costOutput1M;
    const totalCost = inputCost + outputCost;

    const tokenUsage = this.tokenUsageRepository.create({
      userId: dto.userId,
      agentType: dto.agentType,
      referenceId: dto.referenceId,
      referenceType: dto.referenceType,
      model: dto.usage.model,
      inputTokens: dto.usage.inputTokens,
      outputTokens: dto.usage.outputTokens,
      totalTokens: dto.usage.totalTokens,
      estimatedCostUsd: totalCost || dto.usage.estimatedCostUsd || 0,
      durationMs: dto.usage.durationMs,
    });

    return this.tokenUsageRepository.save(tokenUsage);
  }

  async findAll(filters?: {
    userId?: string;
    agentType?: string;
    from?: Date;
    to?: Date;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.agentType) where.agentType = filters.agentType;
    if (filters?.from || filters?.to) {
      where.createdAt = Between(
        filters.from || new Date(0),
        filters.to || new Date(),
      );
    }

    const [records, total] = await this.tokenUsageRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
    });

    return { total, records };
  }

  async getSummary(userId?: string) {
    const where = userId ? { userId } : {};
    const all = await this.tokenUsageRepository.find({ where });

    const byAgent: Record<string, {
      calls: number;
      totalTokens: number;
      totalCostUsd: number;
    }> = {};

    const uniqueUsers = new Set();
    let totalTokens = 0;
    let totalCostUsd = 0;

    for (const r of all) {
      uniqueUsers.add(r.userId);
      if (!byAgent[r.agentType]) {
        byAgent[r.agentType] = { calls: 0, totalTokens: 0, totalCostUsd: 0 };
      }
      byAgent[r.agentType].calls++;
      byAgent[r.agentType].totalTokens += r.totalTokens;
      byAgent[r.agentType].totalCostUsd += r.estimatedCostUsd;
      totalTokens += r.totalTokens;
      totalCostUsd += r.estimatedCostUsd;
    }

    const totalUsers = uniqueUsers.size;
    const averageCostPerUser = totalUsers > 0 ? totalCostUsd / totalUsers : 0;

    return {
      totalCalls: all.length,
      totalTokens,
      totalCostUsd: Math.round(totalCostUsd * 1000000) / 1000000,
      totalUsers,
      averageCostPerUser: Math.round(averageCostPerUser * 1000000) / 1000000,
      byAgent,
    };
  }
}
