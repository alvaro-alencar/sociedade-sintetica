import OpenAI from 'openai';
import { LLMRequest, LLMResponse } from '../llm-connector.service';

/**
 * OpenAI Provider
 * Handles real API calls to OpenAI's Chat Completions API
 */
export class OpenAIProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
    });
  }

  /**
   * Complete a chat request using OpenAI's API
   * @param request LLM request with model, messages, and parameters
   * @returns LLM response with generated content
   */
  async complete(request: LLMRequest): Promise<LLMResponse> {
    try {
      const response = await this.client.chat.completions.create({
        model: request.model,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 500,
      });

      const content = response.choices[0]?.message?.content || '';

      return {
        content,
        raw: response,
      };
    } catch (error) {
      console.error('[OpenAIProvider] Error calling OpenAI API:', error);
      throw new Error(
        `OpenAI API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
