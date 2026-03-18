import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
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

  async updateProfile(userId: string, displayName: string) {
    await this.userRepository.update(userId, { displayName });
    return this.findById(userId);
  }

  async updatePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.userRepository.findOne({ 
      where: { id: userId },
      select: ['id', 'passwordHash'] // Ensure passwordHash is selected
    });
    
    if (!user) throw new UnauthorizedException('User not found');

    const isValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isValid) throw new UnauthorizedException('Invalid current password');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.userRepository.update(userId, { passwordHash });

    return { success: true };
  }
}
