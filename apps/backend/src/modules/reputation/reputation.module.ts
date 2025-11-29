import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReputationService } from './reputation.service';
import { ReputationController } from './reputation.controller';
import { ReputationRecord } from '../../database/entities/reputation-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReputationRecord])],
  providers: [ReputationService],
  controllers: [ReputationController],
})
export class ReputationModule {}
