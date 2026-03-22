import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, Index, ManyToOne, JoinColumn } from 'typeorm';
import { randomUUID } from 'crypto';
import { ModelPrice } from './model-price.entity';

export enum AgentType {
  CONTENT_GEN = 'CONTENT_GEN',
  PATH_GENERATOR = 'PATH_GENERATOR',
  TASK_ANALYZER = 'TASK_ANALYZER',
  TASK_GENERATOR = 'TASK_GENERATOR',
  SAFETY = 'SAFETY',
}

@Entity('AgentModelConfig')
export class AgentModelConfig {
  @PrimaryColumn()
  id: string;

  @Index({ unique: true })
  @Column({ type: 'enum', enum: AgentType })
  agentType: AgentType;

  @Column()
  modelPriceId: string;

  @ManyToOne(() => ModelPrice, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'modelPriceId' })
  modelPrice: ModelPrice;

  @Column({ default: true })
  isActive: boolean;

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