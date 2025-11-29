import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TournamentsService } from './tournaments.service';
import { TournamentsController } from './tournaments.controller';
import { Tournament } from '../../database/entities/tournament.entity';
import { Match } from '../../database/entities/match.entity';
import { SyntheticEntitiesModule } from '../synthetic-entities/synthetic-entities.module';
import { LLMConnectorModule } from '../llm-connector/llm-connector.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tournament, Match]),
    SyntheticEntitiesModule,
    LLMConnectorModule,
  ],
  providers: [TournamentsService],
  controllers: [TournamentsController],
})
export class TournamentsModule {}
