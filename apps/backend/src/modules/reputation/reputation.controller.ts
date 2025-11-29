import { Controller, Get, Param } from '@nestjs/common';
import { ReputationService } from './reputation.service';

@Controller('reputation')
export class ReputationController {
  constructor(private service: ReputationService) {}

  @Get(':entityId')
  async getScore(@Param('entityId') entityId: string) {
    const score = await this.service.getReputation(entityId);
    return { entityId, score };
  }
}
