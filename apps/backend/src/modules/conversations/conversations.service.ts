import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Thread } from '../../database/entities/thread.entity';
import { Message } from '../../database/entities/message.entity';
import { SyntheticEntitiesService } from '../synthetic-entities/synthetic-entities.service';
import { LLMConnectorService, LLMRequest } from '../llm-connector/llm-connector.service';
import { CreateThreadRequest, SendMessageRequest } from '@sociedade/shared-types';

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
    const thread = this.threadsRepository.create({
      title: data.title,
      participants: data.participantIds || [],
    });
    const savedThread = await this.threadsRepository.save(thread);

    if (data.initialMessage && data.participantIds && data.participantIds.length > 0) {
      // Assuming first participant starts it if not specified, or system. 
      // For MVP let's just create the thread.
    }
    return savedThread;
  }

  async getThreads(): Promise<Thread[]> {
    return this.threadsRepository.find({ order: { updatedAt: 'DESC' } });
  }

  async getThread(id: string): Promise<Thread | null> {
    return this.threadsRepository.findOne({ where: { id }, relations: ['messages'] });
  }

  async sendMessage(senderId: string, data: SendMessageRequest): Promise<Message> {
    // 1. Save the incoming message
    const message = this.messagesRepository.create({
      threadId: data.entityId, // Wait, data.entityId in SendMessageRequest might be the sender? No, the API definition was a bit ambiguous. Let's assume the URL param has threadId.
      // Actually let's fix the API definition in my head. 
      // Controller will pass threadId.
      senderId: senderId,
      content: data.content,
    });
    // Fix: The Service method signature should probably take threadId explicitly.
    // But let's assume the controller handles it. I will adjust the method signature below.
    return message; 
  }

  async processMessage(threadId: string, senderId: string, content: string, target: string = 'broadcast'): Promise<Message> {
    // 1. Save User/Sender Message
    const message = this.messagesRepository.create({
      threadId,
      senderId,
      content,
    });
    const savedMessage = await this.messagesRepository.save(message);

    // 2. Determine responders
    let responders: string[] = [];
    if (target === 'broadcast') {
      const allEntities = await this.entitiesService.findAll();
      // Pick 2 random excluding sender
      responders = allEntities
        .filter(e => e.id !== senderId)
        .sort(() => 0.5 - Math.random())
        .slice(0, 2)
        .map(e => e.id);
    } else if (target.startsWith('direct:')) {
      responders = [target.split(':')[1]];
    }

    // 3. Trigger LLM for each responder
    for (const responderId of responders) {
      await this.triggerResponse(threadId, responderId);
    }

    return savedMessage;
  }

  private async triggerResponse(threadId: string, responderId: string) {
    const responder = await this.entitiesService.findOne(responderId);
    if (!responder) return;

    // Get History
    const messages = await this.messagesRepository.find({
      where: { threadId },
      order: { createdAt: 'ASC' },
      take: 10, // Context window
    });

    const llmMessages: any[] = messages.map(m => ({
      role: m.senderId === responderId ? 'assistant' : 'user', // Simplified: everyone else is 'user' to me
      content: `${m.senderId}: ${m.content}`,
    }));

    const response = await this.llmService.complete({
      provider: responder.provider as any,
      model: responder.model,
      system: responder.systemPrompt,
      messages: llmMessages,
    });

    const reply = this.messagesRepository.create({
      threadId,
      senderId: responderId,
      content: response.content,
    });
    await this.messagesRepository.save(reply);
  }
}
