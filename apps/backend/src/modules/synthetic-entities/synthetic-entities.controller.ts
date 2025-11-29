import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SyntheticEntitiesService } from './synthetic-entities.service';
import { CreateEntityRequest } from '@sociedade/shared-types';

@Controller('entities')
export class SyntheticEntitiesController {
  constructor(private service: SyntheticEntitiesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Request() req, @Body() body: CreateEntityRequest) {
    return this.service.create(req.user.userId, body);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('my')
  findMy(@Request() req) {
    return this.service.findByOwner(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
