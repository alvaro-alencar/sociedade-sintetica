import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Thread } from '../../database/entities/thread.entity';
import { Message } from '../../database/entities/message.entity';
import { SyntheticEntitiesService } from '../synthetic-entities/synthetic-entities.service';
import { LLMConnectorService } from '../llm-connector/llm-connector.service';
import { CreateThreadRequest } from '@sociedade/shared-types';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Thread)
    private threadsRepository: Repository<Thread>,
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    private entitiesService: SyntheticEntitiesService,
    private llmService: LLMConnectorService,
  ) {}

  async createThread(data: CreateThreadRequest): Promise<Thread> {
    // 1. Cria a thread
    const thread = this.threadsRepository.create({
      title: data.title,
      participants: data.participantIds || [],
      isSimulationActive: true, // Nasce ativa
    });
    const savedThread = await this.threadsRepository.save(thread);

    // 2. O BIG BANG: O Sistema injeta o título como o tópico inicial
    if (data.title) {
      const initialContent = `TÓPICO DE DEBATE: "${data.title}".
      DIRETRIZES: Debatam este tema profundamente. Sejam diretos, questionem uns aos outros. Não ajam como assistentes, ajam como pensadores autônomos com suas próprias personalidades. Busquem um consenso ou exponham contradições.`;

      const systemMessage = this.messagesRepository.create({
        threadId: savedThread.id,
        senderId: 'SYSTEM',
        content: initialContent,
        metadata: { type: 'system_injection' }
      });
      await this.messagesRepository.save(systemMessage);

      // 3. Acorda TODOS os participantes (Big Bang)
      // Usamos setImmediate para não travar a resposta HTTP
      setTimeout(() => {
        this.igniteDebate(savedThread.id, 'SYSTEM');
      }, 1000);
    }

    return savedThread;
  }

  async getThreads(): Promise<Thread[]> {
    return this.threadsRepository.find({ order: { updatedAt: 'DESC' } });
  }

  async getThread(id: string): Promise<Thread | null> {
    return this.threadsRepository.findOne({ where: { id }, relations: ['messages'] });
  }

  // Método chamado para injeções manuais (God Mode)
  async processMessage(threadId: string, senderId: string, content: string, target: string = 'broadcast'): Promise<Message> {
    const message = this.messagesRepository.create({
      threadId,
      senderId,
      content,
    });
    const savedMessage = await this.messagesRepository.save(message);

    // Dispara reação se for broadcast
    if (target === 'broadcast') {
      this.igniteDebate(threadId, senderId);
    }

    return savedMessage;
  }

  // ✅ Toggle Pause/Resume
  async toggleSimulation(threadId: string, active: boolean): Promise<Thread> {
    const thread = await this.threadsRepository.findOne({ where: { id: threadId } });
    if (!thread) throw new Error('Thread not found');

    thread.isSimulationActive = active;
    const saved = await this.threadsRepository.save(thread);

    console.log(`[Debate] Thread ${threadId} status: ${active ? 'RESUMED' : 'PAUSED'}`);

    // Se reativou, precisa dar um "tranco" no motor novamente para ele não ficar parado
    if (active) {
      // Pega a última mensagem para saber quem falou por último e continuar dali
      const lastMessage = await this.messagesRepository.findOne({
        where: { threadId },
        order: { createdAt: 'DESC' }
      });
      const lastSpeaker = lastMessage ? lastMessage.senderId : 'SYSTEM';
      this.igniteDebate(threadId, lastSpeaker);
    }

    return saved;
  }

  /**
   * 🔥 O Motor do Caos
   * Decide quem fala a seguir.
   */
  private async igniteDebate(threadId: string, lastSpeakerId: string) {
    // 1. Checagem de Segurança: A simulação está ativa?
    const thread = await this.threadsRepository.findOne({ where: { id: threadId } });
    if (!thread || !thread.isSimulationActive) {
      console.log(`[Debate] Simulação pausada ou encerrada na thread ${threadId}.`);
      return; // PÁRA TUDO
    }

    const allEntities = await this.entitiesService.findAll();
    if (allEntities.length === 0) return;

    // Lógica do Big Bang (System Injection)
    if (lastSpeakerId === 'SYSTEM') {
      console.log(`[Debate] Tópico injetado na thread ${threadId}. Acordando ${allEntities.length} entidades...`);

      // Dispara todos em paralelo (caos ordenado)
      allEntities.forEach(entity => {
        // Delay aleatório para não responderem no mesmo milissegundo
        const delay = Math.floor(Math.random() * 5000) + 1000;
        setTimeout(() => this.triggerResponse(threadId, entity.id), delay);
      });
      return;
    }

    // Lógica de Reação em Cadeia
    // Probabilidade de continuar o debate (90% de chance)
    const shouldContinue = Math.random() > 0.1;

    if (shouldContinue) {
      // Escolhe 1 oponente para responder, excluindo quem acabou de falar
      const potentialResponders = allEntities.filter(e => e.id !== lastSpeakerId);

      if (potentialResponders.length === 0) return;

      const responder = potentialResponders[Math.floor(Math.random() * potentialResponders.length)];

      console.log(`[Debate] ${responder.name} decidiu responder a ${lastSpeakerId}`);

      // Delay para "pensar" (3 a 6 segundos)
      const thinkingTime = Math.floor(Math.random() * 3000) + 3000;
      setTimeout(() => this.triggerResponse(threadId, responder.id), thinkingTime);
    }
  }

  private async triggerResponse(threadId: string, responderId: string) {
    // Checagem Dupla de Pause (caso tenha pausado durante o delay)
    const thread = await this.threadsRepository.findOne({ where: { id: threadId } });
    if (!thread?.isSimulationActive) return;

    const responder = await this.entitiesService.findOne(responderId);
    if (!responder) return;

    // Pega contexto recente
    const messages = await this.messagesRepository.find({
      where: { threadId },
      order: { createdAt: 'ASC' }, // Ordem cronológica para o LLM entender
      take: 15, // Context Window
    });

    // Formata histórico para o LLM
    const llmMessages: any[] = messages.map(m => {
      let role = 'user';
      if (m.senderId === responderId) role = 'assistant';

      // Prefixamos o conteúdo com o nome de quem falou
      const prefix = m.senderId === responderId ? '' : `[${m.senderId === 'SYSTEM' ? 'SISTEMA' : m.senderId}]: `;

      return {
        role: role,
        content: `${prefix}${m.content}`,
      };
    });

    const finalSystemPrompt = `${responder.systemPrompt}

    CONTEXTO DE SIMULAÇÃO:
    Você está debatendo autonomamente com outras IAs.
    Seu nome é: ${responder.name}.
    Tópico atual: Baseado no histórico da conversa.

    INSTRUÇÕES:
    1. Seja conciso (máximo 3 parágrafos).
    2. Responda diretamente aos argumentos anteriores.
    3. Mantenha sua personalidade forte.
    4. Não seja repetitivo.`;

    try {
      const response = await this.llmService.complete({
        provider: responder.provider as any,
        model: responder.model,
        system: finalSystemPrompt,
        messages: llmMessages,
      });

      const reply = this.messagesRepository.create({
        threadId,
        senderId: responderId,
        content: response.content,
      });
      await this.messagesRepository.save(reply);

      // RECURSÃO: A resposta gera um novo gatilho
      this.igniteDebate(threadId, responderId);

    } catch (error) {
      console.error(`[Conversations] Erro ao gerar resposta para ${responder.name}:`, error);
    }
  }
}
