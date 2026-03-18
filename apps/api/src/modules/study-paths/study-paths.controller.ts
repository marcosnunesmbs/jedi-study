import { Controller, Post, Get, Param } from '@nestjs/common';
import { StudyPathsService } from './study-paths.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller()
export class StudyPathsController {
  constructor(private readonly studyPaths: StudyPathsService) {}

  @Post('subjects/:subjectId/study-paths/generate')
  generate(@Param('subjectId') subjectId: string, @CurrentUser() user: any) {
    return this.studyPaths.generate(subjectId, user.id);
  }

  @Get('subjects/:subjectId/study-paths/active')
  findActive(@Param('subjectId') subjectId: string, @CurrentUser() user: any) {
    return this.studyPaths.findActive(subjectId, user.id);
  }

  @Get('study-paths/:id')
  findById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.studyPaths.findById(id, user.id);
  }

  @Get('study-paths/:id/status')
  getStatus(@Param('id') id: string, @CurrentUser() user: any) {
    return this.studyPaths.getStatus(id, user.id);
  }
}
