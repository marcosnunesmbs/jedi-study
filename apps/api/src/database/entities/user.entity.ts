import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, BeforeInsert } from 'typeorm';
import { randomUUID } from 'crypto';
import { Subject } from './subject.entity';
import { StudyPath } from './study-path.entity';
import { TokenUsage } from './token-usage.entity';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

@Entity('User')
export class User {
  @PrimaryColumn()
  id: string = randomUUID();

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ nullable: true })
  displayName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Subject, (subject) => subject.user)
  subjects: Subject[];

  @OneToMany(() => StudyPath, (studyPath) => studyPath.user)
  studyPaths: StudyPath[];

  @OneToMany(() => TokenUsage, (tokenUsage) => tokenUsage.user)
  tokenUsage: TokenUsage[];

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = randomUUID();
    }
  }
}
