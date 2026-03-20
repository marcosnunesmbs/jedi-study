import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AdminUsersController } from './admin-users.controller';
import { User } from '../../database/entities/user.entity';
import { Subject } from '../../database/entities/subject.entity';
import { TokenUsageModule } from '../token-usage/token-usage.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Subject]), TokenUsageModule],
  controllers: [UsersController, AdminUsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
