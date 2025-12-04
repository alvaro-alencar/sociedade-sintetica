import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Thread } from '../../database/entities/thread.entity';
import { Message } from '../../database/entities/message.entity';
import { SyntheticEntitiesService } from '../synthetic-entities/synthetic-entities.service';
import { LLMConnectorService } from '../llm-connector/llm-connector.service';
import { CreateThreadRequest } from '@sociedade/shared-types';

@Injectable()
export class ConversationsService {
  private readonly logger = new Logger(ConversationsService.name);

  constructor(
    @InjectRepository(Thread)
    private threadsRepository: Repository<Thread>,
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    private entitiesService: SyntheticEntitiesService,
    private llmService: LLMConnectorService,
  ) {}

  async createThread(data: CreateThreadRequest): Promise<Thread> {
    const thread = this.threadsRepository.create({
      title: data.title,
      participants: data.participantIds || [],
      isSimulationActive: true,
    });
    const savedThread = await this.threadsRepository.save(thread);

    if (data.title) {
      const initialContent = `TÓPICO: "${data.title}".
      Debatam isso. Sem formalidades. Sejam diretos.`;

      const systemMessage = this.messagesRepository.create({
        threadId: savedThread.id,
        senderId: 'SYSTEM',
        content: initialContent,
        metadata: { type: 'system_injection' }
      });
      await this.messagesRepository.save(systemMessage);

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

  async processMessage(threadId: string, senderId: string, content: string, target: string = 'broadcast'): Promise<Message> {
    const message = this.messagesRepository.create({
      threadId,
      senderId,
      content,
    });
    const savedMessage = await this.messagesRepository.save(message);

    if (target === 'broadcast') {
      this.igniteDebate(threadId, senderId);
    }

    return savedMessage;
  }

  async toggleSimulation(threadId: string, active: boolean): Promise<Thread> {
    const thread = await this.threadsRepository.findOne({ where: { id: threadId } });
    if (!thread) throw new Error('Thread not found');

    thread.isSimulationActive = active;
    const saved = await this.threadsRepository.save(thread);

    this.logger.log(`[Debate] Thread ${threadId} status: ${active ? 'RESUMED' : 'PAUSED'}`);

    if (active) {
      const lastMessage = await this.messagesRepository.findOne({
        where: { threadId },
        order: { createdAt: 'DESC' }
      });
      const lastSpeaker = lastMessage ? lastMessage.senderId : 'SYSTEM';
      this.igniteDebate(threadId, lastSpeaker);
    }

    return saved;
  }

  private async igniteDebate(threadId: string, lastSpeakerId: string) {
    const thread = await this.threadsRepository.findOne({ where: { id: threadId } });
    if (!thread || !thread.isSimulationActive) return;

    const allEntities = await this.entitiesService.findAll();
    if (allEntities.length === 0) return;

    if (lastSpeakerId === 'SYSTEM') {
      this.logger.log(`[Debate] Big Bang na thread ${threadId}.`);
      allEntities.forEach(entity => {
        const delay = Math.floor(Math.random() * 5000) + 1000;
        setTimeout(() => this.triggerResponse(threadId, entity.id), delay);
      });
      return;
    }

    // Probabilidade de 90% de continuar
    if (Math.random() > 0.1) {
      // Evita que a mesma pessoa fale duas vezes seguidas
      const potentialResponders = allEntities.filter(e =>
        e.id !== lastSpeakerId && e.id !== 'SYSTEM'
      );

      if (potentialResponders.length === 0) return;

      const responder = potentialResponders[Math.floor(Math.random() * potentialResponders.length)];

      this.logger.log(`[Debate] ${responder.name} vai responder.`);
      const thinkingTime = Math.floor(Math.random() * 3000) + 3000;
      setTimeout(() => this.triggerResponse(threadId, responder.id), thinkingTime);
    }
  }

  private async triggerResponse(threadId: string, responderId: string) {
    const thread = await this.threadsRepository.findOne({ where: { id: threadId } });
    if (!thread?.isSimulationActive) return;

    const responder = await this.entitiesService.findOne(responderId);
    if (!responder) return;

    const messages = await this.messagesRepository.find({
      where: { threadId },
      order: { createdAt: 'ASC' },
      take: 15,
    });

    const llmMessages: any[] = messages.map(m => {
      const prefix = m.senderId === responderId ? '' : `[${m.senderId === 'SYSTEM' ? 'SISTEMA' : m.senderId}]: `;
      return {
        role: m.senderId === responderId ? 'assistant' : 'user',
        content: `${prefix}${m.content}`,
      };
    });

    // 🔥 PROMPT CORRIGIDO: Remover narração
    const finalSystemPrompt = `${responder.systemPrompt}

    CONTEXTO:
    Você está num chat online debatendo com outras IAs.
    Seu nome: ${responder.name}.

    REGRAS DE ESTILO (CRÍTICO):
    1. Escreva APENAS o que você diria. Nada de ações entre parênteses.
    2. NÃO use asteriscos para narrar ações (*suspiro*, *ri*).
    3. NÃO use frases como "rugindo em binário" ou "olhando fixamente".
    4. Seja natural, como uma mensagem de WhatsApp ou Twitter.
    5. Mantenha sua personalidade, mas expresse-a através das PALAVRAS e do TOM, não de narração.`;

    try {
      const response = await this.llmService.complete({
        provider: responder.provider as any,
        model: responder.model,
        system: finalSystemPrompt,
        messages: llmMessages,
      });

      // 🔥 LIMPEZA EXTRA: Remove qualquer coisa entre parênteses ou asteriscos que tenha sobrado
      let cleanContent = response.content
        .replace(/^\(.*\)/g, '') // Remove (ação) no começo
        .replace(/\*.*?\*/g, '')  // Remove *ação* no meio
        .replace(/^.* diz:/i, '') // Remove "Fulano diz:"
        .trim();

      if (cleanContent) {
        const reply = this.messagesRepository.create({
          threadId,
          senderId: responderId,
          content: cleanContent,
        });
        await this.messagesRepository.save(reply);

        // Continua o loop
        this.igniteDebate(threadId, responderId);
      }

    } catch (error) {
      this.logger.error(`Erro ao gerar resposta para ${responder.name}`, error);
    }
  }
}
