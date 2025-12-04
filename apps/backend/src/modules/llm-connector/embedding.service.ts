import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class EmbeddingService {
  private client: OpenAI;
  private readonly logger = new Logger(EmbeddingService.name);

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;
    const baseURL = process.env.OPENAI_API_KEY ? undefined : 'https://openrouter.ai/api/v1';

    if (!apiKey) {
      this.logger.warn('Nenhuma API Key encontrada para Embeddings. O serviço falhará se chamado.');
    }

    this.client = new OpenAI({
      apiKey: apiKey,
      baseURL: baseURL,
    });
  }

  async embed(text: string): Promise<number[]> {
    try {
      // Usa text-embedding-3-small que é barato e eficiente
      // Se usar OpenRouter, verifique se eles suportam esse modelo ou troque
      const response = await this.client.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });
      return response.data[0].embedding;
    } catch (error) {
      this.logger.error('Erro ao gerar embedding:', error);
      // Retorna vetor zerado em caso de erro para não quebrar a aplicação (MVP)
      // Em produção, isso deveria lançar um erro.
      return new Array(1536).fill(0);
    }
  }
}
