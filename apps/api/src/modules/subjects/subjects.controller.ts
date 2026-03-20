import {
  Controller, Get, Post, Delete, Body, Param, Patch,
} from '@nestjs/common';
import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator';
import { SubjectsService } from './subjects.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

class CreateSubjectDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'])
  skillLevel?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  goals?: string[];
}

class UpdateSubjectDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'])
  skillLevel?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  goals?: string[];
}

@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjects: SubjectsService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.subjects.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.subjects.findOne(id, user.id);
  }

  @Post()
  create(@Body() dto: CreateSubjectDto, @CurrentUser() user: any) {
    return this.subjects.create(user.id, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSubjectDto, @CurrentUser() user: any) {
    return this.subjects.update(id, user.id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.subjects.delete(id, user.id);
  }
}
