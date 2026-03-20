import { Controller, UseGuards, Get, Query, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../database/entities/user.entity';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('withDeleted') withDeleted?: string,
  ) {
    return this.usersService.findAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      role,
      withDeleted: withDeleted === 'true',
    });
  }

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.adminCreate(dto);
  }

  @Patch(':id/reset-password')
  async resetPassword(@Param('id') id: string) {
    return this.usersService.resetPassword(id);
  }

  @Delete('bulk')
  async removeBulk(@Body('ids') ids: string[]) {
    return this.usersService.bulkSoftDelete(ids);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.softDelete(id);
  }

  @Patch(':id/restore')
  async restore(@Param('id') id: string) {
    return this.usersService.restore(id);
  }
}
