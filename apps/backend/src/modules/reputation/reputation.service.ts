import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReputationRecord } from '../../database/entities/reputation-record.entity';

@Injectable()
export class ReputationService {
  constructor(
    @InjectRepository(ReputationRecord)
    private repo: Repository<ReputationRecord>,
  ) {}

  async addReputation(entityId: string, score: number, reason: string) {
    const record = this.repo.create({ entityId, score, reason });
    return this.repo.save(record);
  }

  async getReputation(entityId: string): Promise<number> {
    const records = await this.repo.find({ where: { entityId } });
    return records.reduce((acc, curr) => acc + curr.score, 0);
  }
}
