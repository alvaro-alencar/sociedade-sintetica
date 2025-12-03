import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConversationsService } from './conversations.service';
import { CreateThreadRequest, SendMessageRequest } from '@sociedade/shared-types';

@Controller('threads')
export class ConversationsController {
  constructor(private service: ConversationsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() body: CreateThreadRequest) {
    return this.service.createThread(body);
  }

  @Get()
  findAll() {
    return this.service.getThreads();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.getThread(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/messages')
  async sendMessage(
    @Param('id') threadId: string,
    @Body() body: SendMessageRequest,
    @Request() req
  ) {
    return this.service.processMessage(threadId, body.entityId, body.content, body.target);
  }

  // ✅ NOVO: Endpoint para Pausar/Retomar
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { active: boolean }
  ) {
    return this.service.toggleSimulation(id, body.active);
  }
}
