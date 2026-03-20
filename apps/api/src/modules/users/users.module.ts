import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AdminUsersController } from './admin-users.controller';
import { User } from '../../database/entities/user.entity';
import { TokenUsageModule } from '../token-usage/token-usage.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), TokenUsageModule],
  controllers: [UsersController, AdminUsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
