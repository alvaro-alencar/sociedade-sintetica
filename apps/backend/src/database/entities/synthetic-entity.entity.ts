import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { SyntheticEntity as ISyntheticEntity, LLMProvider } from '@sociedade/shared-types';

@Entity()
export class SyntheticEntity implements ISyntheticEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  provider: LLMProvider;

  @Column()
  model: string;

  @Column('float', { default: 0.7 })
  temperature: number;

  @Column('text')
  systemPrompt: string;

  @Column({ default: 'active' })
  status: 'active' | 'suspended';

  @ManyToOne(() => User, (user) => user.entities)
  owner: User;

  @Column()
  ownerId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  maxTokens?: number;
}
