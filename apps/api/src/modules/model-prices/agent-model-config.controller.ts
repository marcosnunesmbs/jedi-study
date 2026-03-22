import { Controller, UseGuards, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { IsString, IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '../../database/entities/user.entity';
import { AgentModelConfigService } from './agent-model-config.service';
import { AgentType } from '../../database/entities/agent-model-config.entity';

class CreateAgentModelConfigDto {
  @IsEnum(AgentType)
  agentType: AgentType;

  @IsString()
  modelPriceId: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

class UpdateAgentModelConfigDto {
  @IsOptional()
  @IsString()
  modelPriceId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@Controller('config')
export class ConfigController {
  constructor(private readonly agentModelConfigService: AgentModelConfigService) {}

  @Get('agent-model/:agentType')
  @Public()
  async getAgentModel(@Param('agentType') agentType: AgentType) {
    const config = await this.agentModelConfigService.findByAgentType(agentType);
    if (!config) {
      return { agentType, modelName: null };
    }
    return {
      agentType: config.agentType,
      modelName: config.modelPrice?.name,
    };
  }
}

@Controller('admin/agent-model-configs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AgentModelConfigController {
  constructor(private readonly agentModelConfigService: AgentModelConfigService) {}

  @Get()
  findAll() {
    return this.agentModelConfigService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agentModelConfigService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateAgentModelConfigDto) {
    return this.agentModelConfigService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAgentModelConfigDto) {
    return this.agentModelConfigService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.agentModelConfigService.remove(id);
  }
}