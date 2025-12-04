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

  // 🐉 O PODER DO DRAGÃO: Vetor de Embedding (1536 dimensões para OpenAI text-embedding-3-small)
  @Column({
    type: 'vector' as any,
    length: 1536,
    nullable: true
  })
  embeddingVector: number[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  maxTokens?: number;
}
