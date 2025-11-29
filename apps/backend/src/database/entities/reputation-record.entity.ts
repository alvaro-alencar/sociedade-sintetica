import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class ReputationRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  entityId: string;

  @Column('int')
  score: number;

  @Column()
  reason: string;

  @CreateDateColumn()
  createdAt: Date;
}
