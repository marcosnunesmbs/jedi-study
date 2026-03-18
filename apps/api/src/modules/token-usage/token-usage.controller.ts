import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { TokenUsageService } from './token-usage.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin/token-usage')
@UseGuards(RolesGuard)
@Roles('ADMIN')
export class TokenUsageController {
  constructor(private readonly tokenUsage: TokenUsageService) {}

  @Get()
  findAll(
    @Query('userId') userId?: string,
    @Query('agentType') agentType?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.tokenUsage.findAll({
      userId,
      agentType,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Get('summary')
  getSummary(@Query('userId') userId?: string) {
    return this.tokenUsage.getSummary(userId);
  }
}
