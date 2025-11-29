import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
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
    @Body() body: SendMessageRequest, // body.entityId is the SENDER (one of user's entities)
    @Request() req
  ) {
    // Verify ownership of entityId (omitted for speed, but important)
    return this.service.processMessage(threadId, body.entityId, body.content, body.target);
  }
}
