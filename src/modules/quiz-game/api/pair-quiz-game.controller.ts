import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../user-accounts/guards/bearer/jwt-auth.guard';
import type { Request } from 'express';
import { ConnectToPairGameCommand } from '../application/usecases/connection.usecase';

@Controller('pair-game-quiz/pairs/connection')
export class PairQuizGameController {
  constructor(private commandBus: CommandBus) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  // CONNECT USER TO PAIR QUIZ GAME
  async connection(@Req() req: Request) {
    const userInfo = req.user as { userId: string; login: string };
    return await this.commandBus.execute<ConnectToPairGameCommand, void>(
      new ConnectToPairGameCommand(userInfo),
    );
  }
}
