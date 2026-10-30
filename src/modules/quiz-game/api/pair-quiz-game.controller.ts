import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../user-accounts/guards/bearer/jwt-auth.guard';
import type { Request } from 'express';
import { ConnectToPairGameCommand } from '../application/usecases/connection.usecase';
import { GameResponseDto } from '../dto/game-response.dto';
import { QuizGameService } from '../application/quiz-game.service';

@Controller('pair-game-quiz/pairs')
export class PairQuizGameController {
  constructor(
    private commandBus: CommandBus,
    private gameService: QuizGameService,
  ) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  // Returns game by id
  async getGameById(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const userInfo = req.user as { userId: string; login: string };
    await this.gameService.findById(id, userInfo.userId);
    return;
  }

  @Post('/connection')
  @UseGuards(JwtAuthGuard)
  // CONNECT USER TO PAIR QUIZ GAME
  async connection(@Req() req: Request) {
    const userInfo = req.user as { userId: string; login: string };
    return await this.commandBus.execute<
      ConnectToPairGameCommand,
      GameResponseDto
    >(new ConnectToPairGameCommand(userInfo));
  }
}
