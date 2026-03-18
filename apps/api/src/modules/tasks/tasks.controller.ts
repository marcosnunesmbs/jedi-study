import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { TasksService } from './tasks.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

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
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tasks.findOne(id, user.id);
  }

  @Post('tasks/:id/submit')
  submit(@Param('id') id: string, @Body() dto: SubmitTaskDto, @CurrentUser() user: any) {
    return this.tasks.submit(id, dto.content, dto.contentType, user.id);
  }

  @Get('submissions/:submissionId/status')
  getStatus(@Param('submissionId') submissionId: string, @CurrentUser() user: any) {
    return this.tasks.getSubmissionStatus(submissionId, user.id);
  }

  @Get('submissions/:submissionId/analysis')
  getAnalysis(@Param('submissionId') submissionId: string, @CurrentUser() user: any) {
    return this.tasks.getAnalysis(submissionId, user.id);
  }
}
