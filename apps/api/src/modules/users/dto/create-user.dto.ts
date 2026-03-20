import { IsEmail, IsNotEmpty, IsOptional, IsEnum, IsString } from 'class-validator';
import { UserRole } from '../../../database/entities/user.entity';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  displayName?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
