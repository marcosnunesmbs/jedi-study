import { IsString } from 'class-validator';
import { IsStrongPassword } from '../../../common/decorators/strong-password.decorator';

export class UpdatePasswordDto {
  @IsString()
  oldPassword: string;

  @IsString()
  @IsStrongPassword()
  newPassword: string;
}
