import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, BeforeInsert, Index, JoinColumn, Unique } from 'typeorm';
import { randomUUID } from 'crypto';
import { StudyPath } from './study-path.entity';
import { Task } from './task.entity';
import { Content } from './content.entity';

@Entity('Phase')
@Unique(['studyPathId', 'order'])
export class Phase {
  @PrimaryColumn()
  id: string = randomUUID();

  @Index()
  @Column()
  studyPathId: string;

  @ManyToOne(() => StudyPath, (studyPath) => studyPath.phases, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studyPathId' })
  studyPath: StudyPath;

  @Column()
  order: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  objectives: string; // JSON string

  @Column({ type: 'text' })
  topics: string; // JSON string

  @Column({ default: 'LOCKED' })
  status: string;

  @Column({ default: 0 })
  estimatedHours: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Task, (task) => task.phase)
  tasks: Task[];

  @OneToMany(() => Content, (content) => content.phase)
  contents: Content[];

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = randomUUID();
    }
  }
}
