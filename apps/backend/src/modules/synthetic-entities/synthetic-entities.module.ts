import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyntheticEntitiesService } from './synthetic-entities.service';
import { SyntheticEntitiesController } from './synthetic-entities.controller';
import { SyntheticEntity } from '../../database/entities/synthetic-entity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SyntheticEntity])],
  providers: [SyntheticEntitiesService],
  controllers: [SyntheticEntitiesController],
  exports: [SyntheticEntitiesService],
})
export class SyntheticEntitiesModule {}
