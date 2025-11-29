import { Module } from '@nestjs/common';
import { LLMConnectorService } from './llm-connector.service';

@Module({
  providers: [LLMConnectorService],
  exports: [LLMConnectorService],
})
export class LLMConnectorModule {}
