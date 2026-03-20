import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, BeforeInsert, Index, JoinColumn } from 'typeorm';
import { randomUUID } from 'crypto';
import { User } from './user.entity';
import { Subject } from './subject.entity';
import { Phase } from './phase.entity';

@Entity('StudyPath')
@Index(['subjectId', 'isActive'])
export class StudyPath {
  @PrimaryColumn()
  id: string = randomUUID();

  @Index()
  @Column()
  subjectId: string;

  @ManyToOne(() => Subject, (subject) => subject.studyPaths, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subjectId' })
  subject: Subject;

  @Index()
  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.studyPaths)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ default: 1 })
  version: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 'GENERATING' })
  status: string;

  @Column({ type: 'text', nullable: true })
  rawAgentOutput: string;

  @Column({ default: 0 })
  estimatedHours: number;

  @Column({ default: 0 })
  totalPhases: number;

  @Column({ type: 'text', nullable: true })
  welcomeMessage: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Phase, (phase) => phase.studyPath)
  phases: Phase[];

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = randomUUID();
    }
  }
}
