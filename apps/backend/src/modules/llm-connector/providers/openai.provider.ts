import OpenAI from 'openai';
import { LLMRequest, LLMResponse } from '../llm-connector.service';

export class OpenAIProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async complete(request: LLMRequest): Promise<LLMResponse> {
    try {
      // ✅ CORREÇÃO CRÍTICA: Inserir o System Prompt no início das mensagens
      const messages = [...request.messages];
      if (request.system) {
        messages.unshift({ role: 'system', content: request.system });
      }

      const response = await this.client.chat.completions.create({
        model: request.model,
        messages: messages as any, // Cast necessário pois tipos podem divergir levemente
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 500,
      });

      return {
        content: response.choices[0]?.message?.content || '',
        raw: response,
      };
    } catch (error) {
      console.error('[OpenAIProvider] Error:', error);
      throw new Error(`OpenAI API call failed: ${error instanceof Error ? error.message : 'Unknown'}`);
    }
  }
}
