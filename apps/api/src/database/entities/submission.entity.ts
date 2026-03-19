import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, OneToOne, BeforeInsert, Index, JoinColumn } from 'typeorm';
import { randomUUID } from 'crypto';
import { Task } from './task.entity';
import { Analysis } from './analysis.entity';

@Entity('Submission')
export class Submission {
  @PrimaryColumn()
  id: string;

  @Index()
  @Column()
  taskId: string;

  @ManyToOne(() => Task, (task) => task.submissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taskId' })
  task: Task;

  @Column()
  attempt: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: 'TEXT' })
  contentType: string;

  @Column({ default: 'PENDING' })
  status: string;

  @Column({ nullable: true })
  score: number;

  @Column({ nullable: true })
  passed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @OneToOne(() => Analysis, (analysis) => analysis.submission)
  analysis: Analysis;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = randomUUID();
    }
  }
}
