import { Controller, Get, Query } from '@nestjs/common';
import { TokenUsageService } from './token-usage.service';

@Controller('admin/token-usage')
export class TokenUsageController {
  constructor(private readonly tokenUsage: TokenUsageService) {}

  @Get()
  findAll(
    @Query('agentType') agentType?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.tokenUsage.findAll({
      agentType,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Get('summary')
  getSummary() {
    return this.tokenUsage.getSummary();
  }
}
