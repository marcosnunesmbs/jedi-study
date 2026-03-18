import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, BeforeInsert, Index, JoinColumn } from 'typeorm';
import { createId } from '@paralleldrive/cuid2';
import { User } from './user.entity';

@Entity('TokenUsage')
export class TokenUsage {
  @PrimaryColumn()
  id: string;

  @Index()
  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.tokenUsage)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Index()
  @Column()
  agentType: string;

  @Index()
  @Column()
  referenceId: string;

  @Column()
  referenceType: string;

  @Column()
  model: string;

  @Column()
  inputTokens: number;

  @Column()
  outputTokens: number;

  @Column()
  totalTokens: number;

  @Column({ type: 'float', default: 0 })
  estimatedCostUsd: number;

  @Column({ nullable: true })
  durationMs: number;

  @Index()
  @CreateDateColumn()
  createdAt: Date;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = createId();
    }
  }
}
