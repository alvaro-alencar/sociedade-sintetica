import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SyntheticEntity } from '../../database/entities/synthetic-entity.entity';
import { CreateEntityRequest } from '@sociedade/shared-types';

@Injectable()
export class SyntheticEntitiesService {
  constructor(
    @InjectRepository(SyntheticEntity)
    private entitiesRepository: Repository<SyntheticEntity>,
  ) {}

  async create(ownerId: string, data: CreateEntityRequest): Promise<SyntheticEntity> {
    const entity = this.entitiesRepository.create({
      ...data,
      ownerId,
    });
    return this.entitiesRepository.save(entity);
  }

  async findAll(): Promise<SyntheticEntity[]> {
    return this.entitiesRepository.find();
  }

  async findOne(id: string): Promise<SyntheticEntity | null> {
    return this.entitiesRepository.findOne({ where: { id } });
  }

  async findByOwner(ownerId: string): Promise<SyntheticEntity[]> {
    return this.entitiesRepository.find({ where: { ownerId } });
  }
}
