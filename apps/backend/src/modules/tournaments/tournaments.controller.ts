import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TournamentsService } from './tournaments.service';
import { CreateTournamentRequest } from '@sociedade/shared-types';

@Controller('tournaments')
export class TournamentsController {
  constructor(private service: TournamentsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() body: CreateTournamentRequest) {
    return this.service.create(body);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/matches')
  createMatch(@Param('id') id: string, @Body() body: { participants: string[] }) {
    return this.service.createMatch(id, body.participants);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('matches/:matchId/run')
  runMatch(@Param('matchId') matchId: string) {
    return this.service.runMatch(matchId);
  }
}
