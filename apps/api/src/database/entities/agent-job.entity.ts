import { Entity, PrimaryColumn, Column, CreateDateColumn, BeforeInsert, Index } from 'typeorm';
import { createId } from '@paralleldrive/cuid2';

@Entity('AgentJob')
export class AgentJob {
  @PrimaryColumn()
  id: string;

  @Column({ unique: true, nullable: true })
  bullJobId: string;

  @Column()
  type: string;

  @Index()
  @Column({ default: 'QUEUED' })
  status: string;

  @Index()
  @Column()
  referenceId: string;

  @Column({ nullable: true })
  error: string;

  @Column({ nullable: true })
  startedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = createId();
    }
  }
}
