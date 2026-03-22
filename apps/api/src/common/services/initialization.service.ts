import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { UsersService } from '../../modules/users/users.service';
import { ModelPricesService } from '../../modules/model-prices/model-prices.service';
import { AgentModelConfigService } from '../../modules/model-prices/agent-model-config.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class InitializationService implements OnModuleInit {
  private readonly logger = new Logger(InitializationService.name);

  constructor(
    private readonly users: UsersService,
    private readonly modelPricesService: ModelPricesService,
    private readonly agentModelConfigService: AgentModelConfigService,
  ) {}

  async onModuleInit() {
    await this.seedAdmin();
    await this.seedModels();
    await this.seedAgentConfigs();
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

  private async seedModels() {
    const result = await this.modelPricesService.seedInitialModels();
    if (result.length > 0) {
      this.logger.log(`Seeded ${result.length} model prices`);
    } else {
      this.logger.log('Model prices already seeded');
    }
  }

  private async seedAgentConfigs() {
    const result = await this.agentModelConfigService.seedDefaultConfigs();
    if (result.length > 0) {
      this.logger.log(`Seeded ${result.length} agent model configs`);
    } else {
      this.logger.log('Agent model configs already seeded');
    }
  }
}
