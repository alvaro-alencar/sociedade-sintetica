import OpenAI from 'openai';
import { LLMRequest, LLMResponse } from '../llm-connector.service';

/**
 * OpenRouter Provider
 * Handles API calls to OpenRouter (aggregates multiple LLM providers)
 * Compatible with OpenAI SDK - just changes the base URL
 *
 * Get your API key at: https://openrouter.ai/keys
 * Browse models at: https://openrouter.ai/models
 */
export class OpenRouterProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'https://sociedade-sintetica.app', // Optional: for rankings
        'X-Title': 'Sociedade Sintética', // Optional: shows in rankings
      },
    });
  }

  /**
   * Complete a chat request using OpenRouter's API
   * @param request LLM request with model, messages, and parameters
   * @returns LLM response with generated content
   */
  async complete(request: LLMRequest): Promise<LLMResponse> {
    try {
      console.log(`[OpenRouter] Calling model: ${request.model}`);

      const response = await this.client.chat.completions.create({
        model: request.model,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 500,
      });

      const content = response.choices[0]?.message?.content || '';

      console.log(`[OpenRouter] Response received (${content.length} chars)`);

      return {
        content,
        raw: response,
      };
    } catch (error) {
      console.error('[OpenRouter] Error calling API:', error);
      throw new Error(
        `OpenRouter API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
