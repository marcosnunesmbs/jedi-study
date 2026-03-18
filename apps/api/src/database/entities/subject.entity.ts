import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, BeforeInsert, Index, JoinColumn } from 'typeorm';
import { createId } from '@paralleldrive/cuid2';
import { User } from './user.entity';
import { StudyPath } from './study-path.entity';

@Entity('Subject')
export class Subject {
  @PrimaryColumn()
  id: string = createId();

  @Index()
  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.subjects, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 'BEGINNER' })
  skillLevel: string;

  @Column({ type: 'text' })
  goals: string; // JSON string

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => StudyPath, (studyPath) => studyPath.subject)
  studyPaths: StudyPath[];

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = createId();
    }
  }
}
