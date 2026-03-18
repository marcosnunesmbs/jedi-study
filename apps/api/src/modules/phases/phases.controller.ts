import { Controller, Get, Param } from '@nestjs/common';
import { PhasesService } from './phases.service';

@Controller('phases')
export class PhasesController {
  constructor(private readonly phases: PhasesService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.phases.findOne(id);
  }
}
