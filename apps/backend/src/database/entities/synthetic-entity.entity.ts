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

  // ✅ NOVO: O "DNA" semântico da entidade para busca vetorial
  // O tipo 'vector' vem da extensão pgvector que ativaremos no Postgres
  // length: 1536 é a dimensão do modelo 'text-embedding-3-small' da OpenAI
  @Column({
    type: 'vector' as any, // Cast necessário pois o TypeORM padrão não conhece 'vector' nativamente
    length: 1536,
    nullable: true
  })
  embeddingVector: number[];

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
