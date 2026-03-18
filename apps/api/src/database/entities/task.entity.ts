import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, BeforeInsert, Index, JoinColumn, Unique } from 'typeorm';
import { createId } from '@paralleldrive/cuid2';
import { Phase } from './phase.entity';
import { Submission } from './submission.entity';

@Entity('Task')
@Unique(['phaseId', 'order'])
export class Task {
  @PrimaryColumn()
  id: string;

  @Index()
  @Column()
  phaseId: string;

  @ManyToOne(() => Phase, (phase) => phase.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'phaseId' })
  phase: Phase;

  @Column()
  order: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ default: 'EXERCISE' })
  type: string;

  @Column({ default: 'PENDING' })
  status: string;

  @Column({ type: 'text', nullable: true })
  projectContext: string; // JSON string

  @Column({ default: 100 })
  maxScore: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Submission, (submission) => submission.task)
  submissions: Submission[];

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = createId();
    }
  }
}
