import { Injectable, BadRequestException } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { TokenUsageService } from '../token-usage/token-usage.service';

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
  ) {}

  async validateInput(userId: string, prompt: string): Promise<void> {
    // 1. Prompt Safety check
    const response = await this.agents.checkSafety({ prompt });

    // Record safety check usage
    await this.tokenUsage.record({
      userId,
      agentType: 'SAFETY',
      referenceId: 'safety-check',
      referenceType: 'SafetyCheck',
      usage: response.usage,
    });

    if (!response.data.safe_prompt) {
      throw new UnsafePromptException(response.data.reason);
    }
  }
}
