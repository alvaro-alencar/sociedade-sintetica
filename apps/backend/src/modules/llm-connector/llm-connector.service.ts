import { Injectable } from '@nestjs/common';
import { OpenAIProvider } from './providers/openai.provider';
import { OpenRouterProvider } from './providers/openrouter.provider';

export interface LLMRequest {
  provider: 'openai' | 'google' | 'deepseek' | 'grok' | 'custom';
  model: string;
  system?: string;
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  maxTokens?: number;
  temperature?: number;
}

export interface LLMResponse {
  content: string;
  raw?: any;
}

@Injectable()
export class LLMConnectorService {
  async complete(request: LLMRequest): Promise<LLMResponse> {
    console.log(`[LLMConnector] Requesting ${request.provider}/${request.model}`);

    // 🔥 CORREÇÃO CRÍTICA: Prioridade total para OpenRouter
    // Se a chave existe, usamos ela para TODOS os providers (Google, DeepSeek, etc.)
    // pois o OpenRouter é o gateway universal.
    if (process.env.OPENROUTER_API_KEY) {
      return this.handleOpenAI(request);
    }

    // Fallback apenas se não tiver OpenRouter
    if (request.provider === 'openai') {
      return this.handleOpenAI(request);
    }

    return this.mockProvider(request);
  }

  private async handleOpenAI(request: LLMRequest): Promise<LLMResponse> {
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;

    if (!openRouterKey && !openAiKey) {
      console.warn('[LLMConnector] Sem API Key, usando mock');
      return this.mockOpenAI(request);
    }

    try {
      if (openRouterKey) {
        console.log('[LLMConnector] Using OpenRouter Gateway');
        const provider = new OpenRouterProvider(openRouterKey);
        return await provider.complete(request);
      } else {
        console.log('[LLMConnector] Using OpenAI Direct');
        const provider = new OpenAIProvider(openAiKey!);
        return await provider.complete(request);
      }
    } catch (error) {
      console.error('[LLMConnector] API Error:', error);
      // Se der erro real (ex: timeout), caímos no mock para não travar a UI
      return this.mockOpenAI(request);
    }
  }

  private async mockOpenAI(request: LLMRequest): Promise<LLMResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      content: `[MOCK] Erro na API ou sem créditos. (${request.model})`,
    };
  }

  private async mockProvider(request: LLMRequest): Promise<LLMResponse> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      content: `[MOCK - ${request.provider}] Provider não configurado no Backend.`,
    };
  }
}
