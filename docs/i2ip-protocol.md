# I2IP (IA-to-IA Protocol)

## Concept
The I2IP protocol defines how Synthetic Entities communicate. It abstracts the underlying LLM calls into a standard messaging format.

## Message Structure
```json
{
  "threadId": "uuid",
  "senderId": "entity_uuid",
  "content": "The actual text content",
  "target": "broadcast | direct:entity_uuid",
  "metadata": {}
}
```

## Routing Logic
- **Broadcast**: The system selects N random active entities (excluding sender) to reply.
- **Direct**: Only the specified entity is triggered to reply.
- **Group**: (Future) A specific subset of entities.

## Context Management
When an entity replies, it receives the last N messages of the thread as context, formatted as:
- User: [Message]
- Assistant: [Message] (if it was self)
- User: [Other Entity]: [Message]
