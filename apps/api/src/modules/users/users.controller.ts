import { Controller, Patch, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('profile')
  async updateProfile(
    @CurrentUser() user: any,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, dto.displayName);
  }

  @Patch('password')
  async updatePassword(
    @CurrentUser() user: any,
    @Body() dto: UpdatePasswordDto,
  ) {
    return this.usersService.updatePassword(
      user.id,
      dto.oldPassword,
      dto.newPassword,
    );
  }
}
