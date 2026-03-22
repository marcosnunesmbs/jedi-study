import { Injectable, BadRequestException } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { TokenUsageService } from '../token-usage/token-usage.service';
import { AgentModelConfigService } from '../model-prices/agent-model-config.service';
import { AgentType } from '../../database/entities/agent-model-config.entity';

export class UnsafePromptException extends BadRequestException {
  constructor(reason: string) {
    super(`Unsafe prompt detected: ${reason}`);
  }
}

@Injectable()
export class SafetyService {
  constructor(
    private readonly agents: AgentsService,
    private readonly tokenUsage: TokenUsageService,
    private readonly agentModelConfigService: AgentModelConfigService,
  ) {}

  async validateInput(userId: string, prompt: string, goals?: string[]): Promise<void> {
    // Build full prompt with goals for comprehensive safety check
    // Limit goals to avoid overly long prompts
    const goalsText = goals?.length
      ? goals.slice(0, 5).join(', ') + (goals.length > 5 ? '...' : '')
      : '';

    const fullPrompt = goalsText
      ? `${prompt}\n\nGoals: ${goalsText}`
      : prompt;

    // Get model configuration for safety agent
    const modelConfig = await this.agentModelConfigService.findByAgentType(AgentType.SAFETY);
    const model = modelConfig?.modelPrice?.name;

    // 1. Prompt Safety check
    const response = await this.agents.checkSafety({ prompt: fullPrompt, model });

    // Record safety check usage
    await this.tokenUsage.record({
      userId,
      agentType: 'SAFETY',
      referenceId: 'safety-check',
      referenceType: 'SafetyCheck',
      model,
      usage: response.usage,
    });

    if (!response.data.safe_prompt) {
      throw new UnsafePromptException(response.data.reason);
    }
  }
}
