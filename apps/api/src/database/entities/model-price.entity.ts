import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, Index } from 'typeorm';
import { randomUUID } from 'crypto';

@Entity('ModelPrice')
export class ModelPrice {
  @PrimaryColumn()
  id: string;

  @Index({ unique: true })
  @Column({ length: 100 })
  name: string;

  @Column({ length: 50, default: 'google' })
  provider: string;

  @Column({ type: 'float', precision: 10, scale: 6 })
  inputPricePer1M: number;

  @Column({ type: 'float', precision: 10, scale: 6 })
  outputPricePer1M: number;

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