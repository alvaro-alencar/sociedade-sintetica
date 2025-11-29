import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { SyntheticEntity } from './synthetic-entity.entity';
import { Account } from '@sociedade/shared-types';

@Entity()
export class User implements Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  organization: string;

  @OneToMany(() => SyntheticEntity, (entity) => entity.owner)
  entities: SyntheticEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
