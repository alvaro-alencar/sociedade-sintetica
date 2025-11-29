export interface I2IPMessageEvent {
  threadId: string;
  senderId: string;
  content: string;
  target: 'broadcast' | string; // 'broadcast' or specific entity ID
}

export interface ReputationUpdateEvent {
  entityId: string;
  change: number;
  reason: string;
}
