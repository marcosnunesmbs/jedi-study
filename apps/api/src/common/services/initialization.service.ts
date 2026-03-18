import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { UsersService } from '../../modules/users/users.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class InitializationService implements OnModuleInit {
  private readonly logger = new Logger(InitializationService.name);

  constructor(private readonly users: UsersService) {}

  async onModuleInit() {
    await this.seedAdmin();
  }

  private async seedAdmin() {
    const adminEmail = 'admin@jedistudy.io';
    const adminPassword = 'JediAdmin123';

    const existing = await this.users.findByEmail(adminEmail);
    if (!existing) {
      this.logger.log(`Seeding admin user: ${adminEmail}`);
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      await this.users.create({
        email: adminEmail,
        passwordHash,
        displayName: 'Jedi Admin',
        role: 'ADMIN',
      });
      this.logger.log('Admin user created successfully');
    } else {
      this.logger.log('Admin user already exists');
    }
  }
}
