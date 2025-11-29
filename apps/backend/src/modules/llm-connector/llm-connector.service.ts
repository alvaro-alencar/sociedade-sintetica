import { Injectable } from '@nestjs/common';
import { OpenAIProvider } from './providers/openai.provider';

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
   */
  private async handleOpenAI(request: LLMRequest): Promise<LLMResponse> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.warn('[LLMConnector] OPENAI_API_KEY not set, using mock response');
      return this.mockOpenAI(request);
    }

    try {
      console.log('[LLMConnector] Using real OpenAI API');
      const provider = new OpenAIProvider(apiKey);
      return await provider.complete(request);
    } catch (error) {
      console.error('[LLMConnector] OpenAI API call failed, falling back to mock:', error);
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
