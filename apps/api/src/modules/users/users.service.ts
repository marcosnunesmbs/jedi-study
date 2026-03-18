import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../database/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: string) {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async create(data: { email: string; passwordHash: string; displayName?: string; role?: 'USER' | 'ADMIN' }) {
    const user = this.userRepository.create({
      ...data,
      role: data.role as UserRole,
    });
    return this.userRepository.save(user);
  }
}
