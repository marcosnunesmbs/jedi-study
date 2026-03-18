import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import type { TokenUsageInfo } from '@jedi-study/shared';

export interface RecordTokenUsageDto {
  agentType: string;
  referenceId: string;
  referenceType: string;
  usage: TokenUsageInfo;
}

@Injectable()
export class TokenUsageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async record(dto: RecordTokenUsageDto) {
    const costInput1M = this.config.get<number>('gemini.costInput1M') || 0;
    const costOutput1M = this.config.get<number>('gemini.costOutput1M') || 0;

    const inputCost = (dto.usage.inputTokens / 1000000) * costInput1M;
    const outputCost = (dto.usage.outputTokens / 1000000) * costOutput1M;
    const totalCost = inputCost + outputCost;

    return this.prisma.tokenUsage.create({
      data: {
        agentType: dto.agentType,
        referenceId: dto.referenceId,
        referenceType: dto.referenceType,
        model: dto.usage.model,
        inputTokens: dto.usage.inputTokens,
        outputTokens: dto.usage.outputTokens,
        totalTokens: dto.usage.totalTokens,
        estimatedCostUsd: totalCost || dto.usage.estimatedCostUsd || 0,
        durationMs: dto.usage.durationMs,
      },
    });
  }

  async findAll(filters?: {
    agentType?: string;
    from?: Date;
    to?: Date;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};
    if (filters?.agentType) where.agentType = filters.agentType;
    if (filters?.from || filters?.to) {
      where.createdAt = {};
      if (filters.from) where.createdAt.gte = filters.from;
      if (filters.to) where.createdAt.lte = filters.to;
    }

    const [total, records] = await Promise.all([
      this.prisma.tokenUsage.count({ where }),
      this.prisma.tokenUsage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
      }),
    ]);

    return { total, records };
  }

  async getSummary() {
    const all = await this.prisma.tokenUsage.findMany();

    const byAgent: Record<string, {
      calls: number;
      totalTokens: number;
      totalCostUsd: number;
    }> = {};

    let totalTokens = 0;
    let totalCostUsd = 0;

    for (const r of all) {
      if (!byAgent[r.agentType]) {
        byAgent[r.agentType] = { calls: 0, totalTokens: 0, totalCostUsd: 0 };
      }
      byAgent[r.agentType].calls++;
      byAgent[r.agentType].totalTokens += r.totalTokens;
      byAgent[r.agentType].totalCostUsd += r.estimatedCostUsd;
      totalTokens += r.totalTokens;
      totalCostUsd += r.estimatedCostUsd;
    }

    return {
      totalCalls: all.length,
      totalTokens,
      totalCostUsd: Math.round(totalCostUsd * 1000000) / 1000000,
      byAgent,
    };
  }
}
