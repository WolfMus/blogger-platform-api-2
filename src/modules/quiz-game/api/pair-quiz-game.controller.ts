import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../user-accounts/guards/bearer/jwt-auth.guard';
import type { Request } from 'express';
import { ConnectToPairGameCommand } from '../application/usecases/connection.usecase';
import { GameResponseDto } from '../dto/game/game-response.dto';
import { QuizGameService } from '../application/quiz-game.service';
import { SendAnswerCommand } from '../application/usecases/send-answer.usecase';
import { AnswerResponseDto } from '../dto/answer/answer-response.dto';
import { AnswerRequestDto } from '../dto/answer/answer-request.dto';
import { QuizGamePaginationInput } from '../types/quiz-pagination.input';
import { QuizGamePaginatedResponseDto } from '../dto/game/game-paginated-view.dto';
import { PlayerStatisticService } from '../player-statistic/application/player-statistic.service';
import { PlayerStatisticResponseDto } from '../player-statistic/dto/statistic-response.dto';

@Controller('pair-game-quiz')
export class PairQuizGameController {
  constructor(
    private commandBus: CommandBus,
    private gameService: QuizGameService,
    private playerStatisticService: PlayerStatisticService,
  ) {}

  @Get('/pairs/my')
  @UseGuards(JwtAuthGuard)
  // RETURNS ALL MY GAMES
  async findMyGames(
    @Req() req: Request,
    @Query() paginationInput: QuizGamePaginationInput,
  ): Promise<QuizGamePaginatedResponseDto> {
    const userInfo = req.user as { userId: string; login: string };
    const games = await this.gameService.findMyGames(
      userInfo.userId,
      paginationInput,
    );
    return games;
  }

  @Get('/users/my-statistic')
  @UseGuards(JwtAuthGuard)
  // GET CURRENT USER STATISTIC
  async findMyStatistic(
    @Req() req: Request,
  ): Promise<PlayerStatisticResponseDto> {
    const userInfo = req.user as { userId: string; login: string };
    const myStatistic = await this.playerStatisticService.findMyStatistic(
      userInfo.userId,
    );
    console.log(myStatistic);
    return myStatistic;
  }

  @HttpCode(HttpStatus.OK)
  @Get('/pairs/my-current')
  @UseGuards(JwtAuthGuard)
  // ✅ RETURN CURRENT UNFINISHED GAME
  async getCurrentGame(@Req() req: Request): Promise<GameResponseDto> {
    const userInfo = req.user as { userId: string; login: string };
    const game = await this.gameService.findCurrentGame(userInfo.userId);
    return game;
  }

  @HttpCode(HttpStatus.OK)
  @Get('/pairs/:id')
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

  @HttpCode(HttpStatus.OK)
  @Post('/pairs/connection')
  @UseGuards(JwtAuthGuard)
  // ✅ CONNECT USER TO PAIR QUIZ GAME
  async connection(@Req() req: Request) {
    const userInfo = req.user as { userId: string; login: string };
    return await this.commandBus.execute<
      ConnectToPairGameCommand,
      GameResponseDto
    >(new ConnectToPairGameCommand(userInfo));
  }

  @HttpCode(HttpStatus.OK)
  @Post('/pairs/my-current/answers')
  @UseGuards(JwtAuthGuard)
  // ✅ SEND ANSWER FOR NEXT QUESTION
  async sendAnswer(
    @Req() req: Request,
    @Body() dto: AnswerRequestDto,
  ): Promise<AnswerResponseDto> {
    const userInfo = req.user as { userId: string; login: string };
    return await this.commandBus.execute<SendAnswerCommand, AnswerResponseDto>(
      new SendAnswerCommand(dto, userInfo.userId),
    );
  }
}
