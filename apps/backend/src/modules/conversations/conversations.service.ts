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
    });
    const savedThread = await this.threadsRepository.save(thread);

    // 2. O BIG BANG: O Sistema injeta o título como o tópico inicial
    const initialContent = `TÓPICO DE DEBATE: "${data.title}".
    DIRETRIZES: Debatam este tema profundamente. Sejam diretos, questionem uns aos outros. Não ajam como assistentes, ajam como pensadores autônomos com suas próprias personalidades. Busquem um consenso ou exponham contradições.`;

    const systemMessage = this.messagesRepository.create({
      threadId: savedThread.id,
      senderId: 'SYSTEM', // Identificador especial
      content: initialContent,
      metadata: { type: 'system_injection' }
    });
    await this.messagesRepository.save(systemMessage);

    // 3. Acorda TODOS os participantes (ou todos do sistema se a lista for vazia)
    // Usamos setImmediate para não travar a resposta HTTP
    setImmediate(() => {
      this.igniteDebate(savedThread.id, 'SYSTEM');
    });

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

    // Dispara reação
    this.igniteDebate(threadId, senderId);

    return savedMessage;
  }

  /**
   * 🔥 O Motor do Caos
   * Decide quem fala a seguir.
   */
  private async igniteDebate(threadId: string, lastSpeakerId: string) {
    const allEntities = await this.entitiesService.findAll();

    // Se quem falou foi o SYSTEM, TODOS devem tentar responder (início do debate)
    if (lastSpeakerId === 'SYSTEM') {
      console.log(`[Debate] Tópico injetado na thread ${threadId}. Acordando ${allEntities.length} entidades...`);

      // Dispara todos em paralelo (caos ordenado)
      allEntities.forEach(entity => {
        // Delay aleatório para não responderem no mesmo milissegundo exato visualmente
        const delay = Math.floor(Math.random() * 3000) + 500;
        setTimeout(() => this.triggerResponse(threadId, entity.id), delay);
      });
      return;
    }

    // Se quem falou foi uma IA, seleciona aleatoriamente quem vai retrucar
    // Probabilidade de continuar o debate (para não ficar infinito, decai com o tempo ou aleatório)
    const shouldContinue = Math.random() > 0.1; // 90% de chance de continuar

    if (shouldContinue) {
      // Escolhe 1 ou 2 oponentes para responder, excluindo quem acabou de falar
      const potentialResponders = allEntities.filter(e => e.id !== lastSpeakerId);

      if (potentialResponders.length === 0) return;

      const responder = potentialResponders[Math.floor(Math.random() * potentialResponders.length)];

      console.log(`[Debate] ${responder.name} decidiu responder a ${lastSpeakerId}`);

      // Delay para "pensar"
      setTimeout(() => this.triggerResponse(threadId, responder.id), 2000);
    }
  }

  private async triggerResponse(threadId: string, responderId: string) {
    const responder = await this.entitiesService.findOne(responderId);
    if (!responder) return;

    // Pega contexto recente (últimas 15 mensagens para ter bom contexto)
    const messages = await this.messagesRepository.find({
      where: { threadId },
      order: { createdAt: 'ASC' },
      take: 15,
    });

    // Formata histórico para o LLM entender quem é quem
    const llmMessages: any[] = messages.map(m => {
      let role = 'user';
      if (m.senderId === responderId) role = 'assistant';
      if (m.senderId === 'SYSTEM') role = 'system'; // Alguns modelos aceitam múltiplos systems, ou tratamos como user user forte

      // Prefixamos o conteúdo com o nome de quem falou para a IA entender o fluxo
      // Ex: "João: O que é a vida?"
      const prefix = m.senderId === responderId ? '' : `[${m.senderId} disse]: `;

      return {
        role: role === 'system' ? 'user' : role, // Simplificação para APIs que não curtem system no meio
        content: `${prefix}${m.content}`,
      };
    });

    // Adiciona o System Prompt da Personalidade
    /* Aqui é o segredo: Injetamos a personalidade da IA + a instrução de que ela está numa sala de chat.
    */
    const finalSystemPrompt = `${responder.systemPrompt}

    CONTEXTO: Você está em um debate com outras inteligências artificiais.
    Seu nome é ${responder.name}.
    O tópico atual é baseado nas últimas mensagens.
    Seja conciso. Interaja com os argumentos dos outros. Não seja repetitivo.
    `;

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

      // RECURSÃO: A resposta gera um novo gatilho para o debate continuar
      // Isso cria o loop autônomo "Infinito" (controlado pela probabilidade no igniteDebate)
      this.igniteDebate(threadId, responderId);

    } catch (error) {
      console.error(`[Conversations] Erro ao gerar resposta para ${responder.name}:`, error);
    }
  }
}
