import { Controller, Get, Param } from '@nestjs/common';
import { PhasesService } from './phases.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('phases')
export class PhasesController {
  constructor(private readonly phases: PhasesService) {}

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.phases.findOne(id, user.id);
  }
}
