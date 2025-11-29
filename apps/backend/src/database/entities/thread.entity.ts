import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Message } from './message.entity';
import { Thread as IThread } from '@sociedade/shared-types';

@Entity()
export class Thread implements IThread {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  title: string;

  @Column('simple-array', { default: '' })
  participants: string[]; // Store Entity IDs

  @OneToMany(() => Message, (message) => message.thread)
  messages: Message[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
