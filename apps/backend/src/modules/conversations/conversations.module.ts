import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { Thread } from '../../database/entities/thread.entity';
import { Message } from '../../database/entities/message.entity';
import { SyntheticEntitiesModule } from '../synthetic-entities/synthetic-entities.module';
import { LLMConnectorModule } from '../llm-connector/llm-connector.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Thread, Message]),
    SyntheticEntitiesModule,
    LLMConnectorModule,
  ],
  providers: [ConversationsService],
  controllers: [ConversationsController],
  exports: [ConversationsService],
})
export class ConversationsModule {}
