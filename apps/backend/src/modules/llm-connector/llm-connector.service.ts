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

    if (request.provider === 'openai') {
      return this.handleOpenAI(request);
    }

    // Default mock for other providers
    return this.mockProvider(request);
  }

  /**
   * Handle OpenAI requests - uses real API if key is available, otherwise falls back to mock
   * Supports both OpenAI direct and OpenRouter (aggregator)
   */
  private async handleOpenAI(request: LLMRequest): Promise<LLMResponse> {
    // Check for OpenRouter first (preferred - gives access to multiple models)
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;

    if (!openRouterKey && !openAiKey) {
      console.warn('[LLMConnector] No API key set (OPENROUTER_API_KEY or OPENAI_API_KEY), using mock response');
      return this.mockOpenAI(request);
    }

    try {
      if (openRouterKey) {
        console.log('[LLMConnector] Using OpenRouter API (access to multiple models)');
        const provider = new OpenRouterProvider(openRouterKey);
        return await provider.complete(request);
      } else {
        console.log('[LLMConnector] Using real OpenAI API');
        const provider = new OpenAIProvider(openAiKey!);
        return await provider.complete(request);
      }
    } catch (error) {
      console.error('[LLMConnector] API call failed, falling back to mock:', error);
      return this.mockOpenAI(request);
    }
  }

  /**
   * Mock OpenAI response for development/testing
   */
  private async mockOpenAI(request: LLMRequest): Promise<LLMResponse> {
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const lastUserMessage = request.messages.filter(m => m.role === 'user').pop()?.content || '';

    return {
      content: `[MOCK] This is a simulated response from OpenAI (${request.model}). I heard you say: "${lastUserMessage}". I am ready to participate in the Synthetic Society.`,
    };
  }

  /**
   * Mock response for non-OpenAI providers
   */
  private async mockProvider(request: LLMRequest): Promise<LLMResponse> {
    await new Promise(resolve => setTimeout(resolve, 800));

    return {
      content: `[MOCK - ${request.provider}] I received your message. Context: ${request.messages.length} messages. I am ready to engage in this synthetic society.`,
    };
  }
}
