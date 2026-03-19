import { Entity, PrimaryColumn, Column, CreateDateColumn, OneToOne, BeforeInsert, JoinColumn } from 'typeorm';
import { randomUUID } from 'crypto';
import { Submission } from './submission.entity';

@Entity('Analysis')
export class Analysis {
  @PrimaryColumn()
  id: string;

  @Column({ unique: true })
  submissionId: string;

  @OneToOne(() => Submission, (submission) => submission.analysis, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'submissionId' })
  submission: Submission;

  @Column()
  agentType: string;

  @Column({ type: 'text' })
  feedback: string;

  @Column({ type: 'text' })
  strengths: string; // JSON string

  @Column({ type: 'text' })
  improvements: string; // JSON string

  @Column()
  score: number;

  @Column()
  passed: boolean;

  @Column({ type: 'text' })
  rawOutput: string; // JSON string

  @CreateDateColumn()
  createdAt: Date;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = randomUUID();
    }
  }
}
