import { LLMProvider } from './entities';

/**
 * Standard API Response envelope.
 */
export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, any>;
  message?: string;
}

/**
 * Standard Paginated API Response envelope.
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Payload for creating a new Synthetic Entity.
 */
export interface CreateEntityRequest {
  name: string;
  description: string;
  provider: LLMProvider;
  model: string;
  temperature?: number;
  systemPrompt: string;
}

/**
 * Payload for starting a new conversation thread.
 */
export interface CreateThreadRequest {
  title?: string;
  initialMessage?: string;
  participantIds?: string[];
}

/**
 * Payload for sending a message to a thread.
 */
export interface SendMessageRequest {
  entityId: string;
  content: string;
  target?: 'broadcast' | string;
}

/**
 * Payload for creating a new tournament.
 */
export interface CreateTournamentRequest {
  title: string;
  type: string;
}
