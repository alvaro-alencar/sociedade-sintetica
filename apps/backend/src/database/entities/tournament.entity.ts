import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Match } from './match.entity';

@Entity()
export class Tournament {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  type: string;

  @Column({ default: 'draft' })
  status: string;

  @OneToMany(() => Match, (match) => match.tournament)
  matches: Match[];

  @CreateDateColumn()
  createdAt: Date;
}
