import { Controller, UseGuards, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../database/entities/user.entity';
import { ModelPricesService } from './model-prices.service';

class CreateModelPriceDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsNumber()
  inputPricePer1M: number;

  @IsNumber()
  outputPricePer1M: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

class UpdateModelPriceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsNumber()
  inputPricePer1M?: number;

  @IsOptional()
  @IsNumber()
  outputPricePer1M?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@Controller('admin/model-prices')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class ModelPricesController {
  constructor(private readonly modelPricesService: ModelPricesService) {}

  @Get()
  findAll() {
    return this.modelPricesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.modelPricesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateModelPriceDto) {
    return this.modelPricesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateModelPriceDto) {
    return this.modelPricesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.modelPricesService.remove(id);
  }
}