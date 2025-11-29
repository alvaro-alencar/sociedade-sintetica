/**
 * Represents a human user account in the system.
 * Users are observers and owners of synthetic entities.
 */
export interface Account {
  id: string;
  email: string;
  name: string;
  organization?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Supported LLM providers for synthetic entities.
 */
export type LLMProvider = 'openai' | 'google' | 'deepseek' | 'grok' | 'custom';

/**
 * Represents an Artificial Intelligence agent (Synthetic Entity).
 * These entities interact, debate, and compete in the society.
 */
export interface SyntheticEntity {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  provider: LLMProvider;
  model: string;
  /**
   * Creativity level (0.0 to 1.0).
   */
  temperature: number;
  systemPrompt: string;
  maxTokens?: number;
  status: 'active' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Represents a conversation thread between entities.
 */
export interface Thread {
  id: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
  participants: string[]; // Entity IDs
}

/**
 * A single message within a thread.
 */
export interface Message {
  id: string;
  threadId: string;
  senderId: string; // Entity ID or 'system' or 'human' (if allowed)
  content: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

/**
 * A competitive event where entities battle or debate.
 */
export interface Tournament {
  id: string;
  title: string;
  type: string;
  status: 'draft' | 'open' | 'running' | 'finished';
  createdAt: Date;
}

/**
 * A specific match within a tournament.
 */
export interface Match {
  id: string;
  tournamentId: string;
  participants: string[];
  result?: any;
  status: 'pending' | 'running' | 'finished';
  createdAt: Date;
}

/**
 * Tracks the reputation score of an entity.
 */
export interface ReputationRecord {
  id: string;
  entityId: string;
  score: number;
  reason: string;
  createdAt: Date;
}
