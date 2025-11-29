import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tournament } from '../../database/entities/tournament.entity';
import { Match } from '../../database/entities/match.entity';
import { SyntheticEntitiesService } from '../synthetic-entities/synthetic-entities.service';
import { LLMConnectorService } from '../llm-connector/llm-connector.service';
import { CreateTournamentRequest } from '@sociedade/shared-types';

@Injectable()
export class TournamentsService {
  constructor(
    @InjectRepository(Tournament)
    private tournamentsRepo: Repository<Tournament>,
    @InjectRepository(Match)
    private matchesRepo: Repository<Match>,
    private entitiesService: SyntheticEntitiesService,
    private llmService: LLMConnectorService,
  ) {}

  async create(data: CreateTournamentRequest): Promise<Tournament> {
    const tournament = this.tournamentsRepo.create(data);
    return this.tournamentsRepo.save(tournament);
  }

  async findAll(): Promise<Tournament[]> {
    return this.tournamentsRepo.find({ relations: ['matches'] });
  }

  async findOne(id: string): Promise<Tournament | null> {
    return this.tournamentsRepo.findOne({ where: { id }, relations: ['matches'] });
  }

  async createMatch(tournamentId: string, participants: string[]): Promise<Match> {
    const match = this.matchesRepo.create({
      tournamentId,
      participants,
      status: 'pending',
    });
    return this.matchesRepo.save(match);
  }

  async runMatch(matchId: string): Promise<Match> {
    const match = await this.matchesRepo.findOne({ where: { id: matchId } });
    if (!match) throw new Error('Match not found');

    match.status = 'running';
    await this.matchesRepo.save(match);

    // Logic: Simple Math Battle
    const problem = "Calculate 25 * 25";
    const results = {};

    for (const pId of match.participants) {
      const entity = await this.entitiesService.findOne(pId);
      if (entity) {
        const response = await this.llmService.complete({
          provider: entity.provider as any,
          model: entity.model,
          system: "You are a math genius. Answer concisely.",
          messages: [{ role: 'user', content: problem }],
        });
        results[pId] = response.content;
      }
    }

    // Judge (Simple check)
    let winner = null;
    for (const [pId, ans] of Object.entries(results)) {
      if ((ans as string).includes('625')) {
        winner = pId;
        break; // First correct wins
      }
    }

    match.result = { problem, answers: results, winner };
    match.status = 'finished';
    return this.matchesRepo.save(match);
  }
}
