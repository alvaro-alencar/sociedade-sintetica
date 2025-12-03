import OpenAI from 'openai';
import { LLMRequest, LLMResponse } from '../llm-connector.service';

export class OpenRouterProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'https://sociedade-sintetica.app',
        'X-Title': 'Sociedade Sintética',
      },
    });
  }

  async complete(request: LLMRequest): Promise<LLMResponse> {
    try {
      // ✅ CORREÇÃO CRÍTICA: Inserir o System Prompt no início das mensagens
      const messages = [...request.messages];
      if (request.system) {
        messages.unshift({ role: 'system', content: request.system });
      }

      console.log(`[OpenRouter] Sending to ${request.model} with system prompt length: ${request.system?.length || 0}`);

      const response = await this.client.chat.completions.create({
        model: request.model,
        messages: messages as any,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 500,
      });

      const content = response.choices[0]?.message?.content || '';
      return { content, raw: response };
    } catch (error) {
      console.error('[OpenRouter] Error:', error);
      throw new Error(`OpenRouter API call failed: ${error instanceof Error ? error.message : 'Unknown'}`);
    }
  }
}
