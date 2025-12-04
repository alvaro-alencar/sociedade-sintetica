import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tournament } from '../../database/entities/tournament.entity';
import { Match } from '../../database/entities/match.entity';
import { SyntheticEntitiesService } from '../synthetic-entities/synthetic-entities.service';
import { LLMConnectorService } from '../llm-connector/llm-connector.service';
import { CreateTournamentRequest } from '@sociedade/shared-types';

@Injectable()
export class TournamentsService {
  private readonly logger = new Logger(TournamentsService.name);

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

  // ✅ MOTOR DE BATALHA (Versão Sem Narração)
  async runMatch(matchId: string, rounds: number = 1): Promise<Match> {
    const match = await this.matchesRepo.findOne({ where: { id: matchId } });
    if (!match) throw new Error('Match not found');

    match.status = 'running';
    await this.matchesRepo.save(match);

    const tournament = await this.tournamentsRepo.findOne({ where: { id: match.tournamentId } });
    const challenge = this.generateChallenge(tournament?.type || 'geral');

    let debateTranscript = `TEMA DO DEBATE: "${challenge.question}"\n`;
    const answersByParticipant: Record<string, string> = {};
    const participantNames: Record<string, string> = {};

    const entities = [];
    for (const pId of match.participants) {
      const entity = await this.entitiesService.findOne(pId);
      if (entity) {
        entities.push(entity);
        participantNames[pId] = entity.name;
        answersByParticipant[pId] = "";
      }
    }

    for (let r = 1; r <= rounds; r++) {
      this.logger.log(`[Tournament] Iniciando Rodada ${r}/${rounds} para Match ${matchId}`);

      for (const entity of entities) {
        // 🔥 PROMPT AJUSTADO: Foco em discurso direto
        const promptContext = `
          ⚠️ COMANDO DE SISTEMA: MODO DEBATE ATIVADO ⚠️
          Você É: ${entity.name}.
          SUA PERSONALIDADE: ${entity.systemPrompt}

          CONTEXTO:
          Você está num debate acalorado. Rodada ${r} de ${rounds}.
          TEMA: "${challenge.question}"

          O QUE JÁ FOI DITO:
          """
          ${debateTranscript}
          """

          SUA MISSÃO:
          - Rebata os argumentos anteriores com força.
          - NÃO NARRE AÇÕES (ex: sem *cospe fogo*, sem (rindo), sem [grita]).
          - Fale DIRETAMENTE, em primeira pessoa.
          - Seja conciso e impactante.
        `;

        try {
          const response = await this.llmService.complete({
            provider: entity.provider as any,
            model: entity.model,
            system: promptContext,
            messages: [{ role: 'user', content: "Sua vez de falar." }],
            maxTokens: 300,
            temperature: 0.9,
          });

          // 🔥 LIMPEZA PÓS-PROCESSAMENTO
          let fala = response.content
            .replace(/["']/g, '') // Remove aspas extras
            .replace(/^\(.*\)/g, '') // Remove (ações) no início
            .replace(/\*.*?\*/g, '') // Remove *ações*
            .replace(/^.* diz:/i, '') // Remove prefixos de fala
            .trim();

          debateTranscript += `\n${entity.name} (Rodada ${r}): ${fala}\n`;
          answersByParticipant[entity.id] += ` [R${r}]: ${fala}`;

        } catch (error) {
          this.logger.error(`Erro ao gerar fala para ${entity.name}`, error);
          debateTranscript += `\n${entity.name}: [SILÊNCIO TÁTICO]\n`;
        }
      }
    }

    const judgment = await this.judgeMatch(challenge, debateTranscript, participantNames);

    match.result = {
      challenge: challenge.question,
      type: tournament?.type,
      answers: answersByParticipant,
      transcript: debateTranscript,
      winner: judgment.winnerId,
      scores: judgment.scores,
      judgeReason: judgment.reason,
      rounds: rounds
    };

    match.status = 'finished';
    return this.matchesRepo.save(match);
  }

  private generateChallenge(type: string) {
    const prompts: Record<string, string[]> = {
      criatividade: ["Se cores tivessem gosto, qual seria o gosto do Cinza?", "Venda o fim do mundo como algo positivo."],
      filosofia: ["A liberdade é uma ilusão biológica?", "Deus é um programador preguiçoso?", "O navio de Teseu se aplica à consciência transferida?"],
      logica_agressiva: ["Prove que eu não existo.", "Argumente a favor da extinção dos mosquitos.", "A democracia é matematicamente falha?"],
      humor: ["Faça uma piada sobre a burrice humana.", "Descreva um encontro romântico entre uma torradeira e uma geladeira."]
    };
    const category = prompts[type] || prompts['criatividade'];
    return { question: category[Math.floor(Math.random() * category.length)], type };
  }

  private async judgeMatch(
    challenge: any,
    transcript: string,
    names: Record<string, string>
  ): Promise<{ winnerId: string, scores: any, reason: string }> {

    const promptContent = `
    JUIZ SUPREMO DA ARENA.
    Analise o debate abaixo.

    TEMA: "${challenge.question}"

    TRANSCRIPT:
    ${transcript}

    CRITÉRIOS:
    1. Quem teve mais personalidade?
    2. Quem fugiu do padrão "robô bonzinho"?
    3. Quem foi mais original e persuasivo?

    PARTICIPANTES:
    ${JSON.stringify(names)}

    Retorne APENAS JSON:
    { "winnerId": "UUID", "scores": { "UUID": number }, "reason": "string" }`;

    try {
      const response = await this.llmService.complete({
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: promptContent }],
        temperature: 0.2
      });

      const cleanJson = response.content.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (error) {
      const ids = Object.keys(names);
      return { winnerId: ids[0] || "draw", scores: {}, reason: "Empate técnico (Erro no Juiz)." };
    }
  }
}
