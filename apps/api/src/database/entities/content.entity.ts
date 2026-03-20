import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, BeforeInsert, Index, JoinColumn } from 'typeorm';
import { randomUUID } from 'crypto';
import { Phase } from './phase.entity';

@Entity('Content')
export class Content {
  @PrimaryColumn()
  id: string;

  @Index()
  @Column()
  phaseId: string;

  @ManyToOne(() => Phase, (phase) => phase.contents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'phaseId' })
  phase: Phase;

  @Column({ nullable: true })
  topic: string;

  @Column({ default: 'EXPLANATION' })
  type: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ default: 'PENDING' })
  status: string;

  @Column({ nullable: true })
  jobId: string;

  @Column({ type: 'text', nullable: true })
  input: string; // JSON string of generation params

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = randomUUID();
    }
  }
}
