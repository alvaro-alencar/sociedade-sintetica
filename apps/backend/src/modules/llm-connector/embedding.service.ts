import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class EmbeddingService {
  private client: OpenAI;

  constructor() {
    // Usa a mesma chave que já configuramos
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  /**
   * Transforma texto em um vetor de 1536 dimensões.
   * Modelo: text-embedding-3-small (Rápido e muito barato)
   */
  async generateEmbedding(text: string): Promise<number[]> {
    if (!process.env.OPENAI_API_KEY) {
      // Mock para desenvolvimento sem custos
      console.warn('[Embedding] Usando vetor MOCK (API Key ausente)');
      return Array(1536).fill(0).map(() => Math.random());
    }

    try {
      const response = await this.client.embeddings.create({
        model: "text-embedding-3-small",
        input: text.replace(/\n/g, ' '), // Remove quebras de linha para melhor performance
        encoding_format: "float",
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('[Embedding] Erro ao gerar embedding:', error);
      throw error;
    }
  }
}
