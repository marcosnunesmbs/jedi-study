import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { TasksService } from './tasks.service';

class SubmitTaskDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsEnum(['TEXT', 'CODE', 'MARKDOWN'])
  contentType?: string;
}

@Controller()
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get('tasks/:id')
  findOne(@Param('id') id: string) {
    return this.tasks.findOne(id);
  }

  @Post('tasks/:id/submit')
  submit(@Param('id') id: string, @Body() dto: SubmitTaskDto) {
    return this.tasks.submit(id, dto.content, dto.contentType);
  }

  @Get('submissions/:submissionId/status')
  getStatus(@Param('submissionId') submissionId: string) {
    return this.tasks.getSubmissionStatus(submissionId);
  }

  @Get('submissions/:submissionId/analysis')
  getAnalysis(@Param('submissionId') submissionId: string) {
    return this.tasks.getAnalysis(submissionId);
  }
}
