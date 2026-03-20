import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { User, UserRole } from '../../database/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private generateRandomPassword(length = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    const bytes = randomBytes(length);
    for (let i = 0; i < length; i++) {
      password += charset[bytes[i] % charset.length];
    }
    // Simple check to ensure it has at least one letter and one number to satisfy the new policy
    if (!(/[a-zA-Z]/.test(password) && /[0-9]/.test(password))) {
      return this.generateRandomPassword(length);
    }
    return password;
  }

  async adminCreate(data: { email: string; displayName?: string; role?: UserRole }) {
    const existing = await this.findByEmail(data.email);
    if (existing) throw new ConflictException('Email already registered');

    const plainPassword = this.generateRandomPassword();
    const passwordHash = await bcrypt.hash(plainPassword, 12);

    const user = this.userRepository.create({
      ...data,
      passwordHash,
    });

    const savedUser = await this.userRepository.save(user);

    return {
      user: savedUser,
      password: plainPassword,
    };
  }

  async resetPassword(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const plainPassword = this.generateRandomPassword();
    const passwordHash = await bcrypt.hash(plainPassword, 12);

    await this.userRepository.update(userId, { passwordHash });

    return {
      password: plainPassword,
    };
  }

  async softDelete(id: string) {
    return this.userRepository.softDelete(id);
  }

  async bulkSoftDelete(ids: string[]) {
    return this.userRepository.softDelete(ids);
  }

  async restore(id: string) {
    return this.userRepository.restore(id);
  }

  async findAll(options: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    withDeleted?: boolean;
  }) {
    const { page = 1, limit = 10, search, role, withDeleted = false } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (withDeleted) {
      queryBuilder.withDeleted();
    }

    if (search) {
      queryBuilder.andWhere(
        '(user.email LIKE :search OR user.displayName LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    queryBuilder.orderBy('user.createdAt', 'DESC');
    queryBuilder.skip(skip);
    queryBuilder.take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

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
