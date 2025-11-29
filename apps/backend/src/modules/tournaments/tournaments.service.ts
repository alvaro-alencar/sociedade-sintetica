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

    // ✅ CORREÇÃO: Gera pergunta dinâmica ao invés de hardcoded
    const challenge = this.generateChallenge();
    const results = {};

    for (const pId of match.participants) {
      const entity = await this.entitiesService.findOne(pId);
      if (entity) {
        const response = await this.llmService.complete({
          provider: entity.provider as any,
          model: entity.model,
          system: challenge.systemPrompt,
          messages: [{ role: 'user', content: challenge.question }],
        });
        results[pId] = response.content;
      }
    }

    // ✅ CORREÇÃO: Validação mais robusta das respostas
    let winner = null;
    let bestScore = 0;

    for (const [pId, ans] of Object.entries(results)) {
      const score = this.scoreAnswer(ans as string, challenge);
      if (score > bestScore) {
        bestScore = score;
        winner = pId;
      }
    }

    match.result = {
      challenge: challenge.question,
      type: challenge.type,
      answers: results,
      winner,
      scores: Object.fromEntries(
        Object.entries(results).map(([id, ans]) => [id, this.scoreAnswer(ans as string, challenge)])
      )
    };
    match.status = 'finished';
    return this.matchesRepo.save(match);
  }

  /**
   * ✅ NOVO: Gera desafios dinâmicos e variados
   */
  private generateChallenge() {
    const challenges = [
      // Matemática
      {
        type: 'math',
        question: `Calcule: ${Math.floor(Math.random() * 50 + 10)} * ${Math.floor(Math.random() * 50 + 10)}`,
        systemPrompt: 'Você é um gênio da matemática. Responda apenas com o número, sem explicações.',
        validator: (ans: string) => {
          const match = ans.match(/\d+/);
          return match ? parseInt(match[0]) : null;
        },
      },
      // Lógica
      {
        type: 'logic',
        question: 'Se todos os A são B, e todos os B são C, então todos os A são C? Responda apenas Sim ou Não.',
        systemPrompt: 'Você é um especialista em lógica. Seja conciso.',
        validator: (ans: string) => ans.toLowerCase().includes('sim') ? 'sim' : 'não',
      },
      // Conhecimento Geral
      {
        type: 'knowledge',
        question: 'Qual é a capital do Brasil? Responda apenas o nome da cidade.',
        systemPrompt: 'Você é um especialista em geografia. Seja conciso.',
        validator: (ans: string) => ans.toLowerCase().replace(/[^a-z]/g, ''),
      },
      // Criatividade
      {
        type: 'creativity',
        question: 'Complete a frase de forma criativa: "A inteligência artificial é..."',
        systemPrompt: 'Você é um poeta e filósofo. Seja criativo mas conciso (máximo 20 palavras).',
        validator: (ans: string) => ans.length, // Pontuação por tamanho
      },
    ];

    return challenges[Math.floor(Math.random() * challenges.length)];
  }

  /**
   * ✅ NOVO: Pontua respostas de forma mais inteligente
   */
  private scoreAnswer(answer: string, challenge: any): number {
    const normalized = answer.toLowerCase().trim();

    switch (challenge.type) {
      case 'math':
        // Extrai números da resposta e compara com a pergunta
        const nums = challenge.question.match(/\d+/g).map(Number);
        const expected = nums[0] * nums[1];
        const answerNum = parseInt(answer.match(/\d+/)?.[0] || '0');
        return answerNum === expected ? 100 : 0;

      case 'logic':
        return normalized.includes('sim') ? 100 : 0;

      case 'knowledge':
        return normalized.includes('brasília') || normalized.includes('brasilia') ? 100 : 0;

      case 'creativity':
        // Pontuação baseada em tamanho e presença de palavras-chave
        let score = Math.min(answer.split(' ').length * 5, 50); // Até 50 pontos por tamanho
        if (normalized.includes('futuro') || normalized.includes('humanidade')) score += 25;
        if (normalized.includes('transformar') || normalized.includes('revolucionar')) score += 25;
        return Math.min(score, 100);

      default:
        return 0;
    }
  }
}
