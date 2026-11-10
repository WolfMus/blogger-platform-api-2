import {
  Body,
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
import { AnswerResponseDto } from '../dto/answer-response.dto';
import { AnswerRequestDto } from '../dto/answer-request.dto';

@Controller('pair-game-quiz/pairs')
export class PairQuizGameController {
  constructor(
    private commandBus: CommandBus,
    private gameService: QuizGameService,
  ) {}

  @Get('/my-current')
  @UseGuards(JwtAuthGuard)
  // ✅ RETURN CURRENT UNFINISHED GAME
  async getCurrentGame(@Req() req: Request): Promise<GameResponseDto> {
    const userInfo = req.user as { userId: string; login: string };
    const game = await this.gameService.findCurrentGame(userInfo.userId);
    return game;
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  // ✅ RETURNS GAME BY ID
  async getGameById(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<GameResponseDto> {
    const userInfo = req.user as { userId: string; login: string };
    const game = await this.gameService.findById(id, userInfo.userId);
    return game;
  }

  @Post('/connection')
  @UseGuards(JwtAuthGuard)
  // ✅ CONNECT USER TO PAIR QUIZ GAME
  async connection(@Req() req: Request) {
    const userInfo = req.user as { userId: string; login: string };
    return await this.commandBus.execute<
      ConnectToPairGameCommand,
      GameResponseDto
    >(new ConnectToPairGameCommand(userInfo));
  }

  @Post('/my-current/answers')
  @UseGuards(JwtAuthGuard)
  // ✅ SEND ANSWER FOR NEXT QUESTION
  async sendAnswer(
    @Req() req: Request,
    @Body() dto: AnswerRequestDto,
  ): Promise<AnswerResponseDto> {
    const userInfo = req.user as { userId: string; login: string };
    const answerResponseDto = await this.gameService.sendAnswer(
      userInfo.userId,
      dto.answer,
    );
    return answerResponseDto;
  }
}
