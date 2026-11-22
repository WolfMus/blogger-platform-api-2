import { HttpStatus, Injectable } from '@nestjs/common';
import { GameQwRepository } from '../infrastructure/game/game-query.repository';
import {
  DomainException,
  Extension,
} from '../../../core/exceptions/domain-exception';
import { GameResponseDto } from '../dto/game/game-response.dto';
import { QuizGameStatusesEnum } from '../types/quiz-game-status.enum';
import { QuestionQwRepository } from '../infrastructure/question/question-query.repository';
import { QuizGameMapper } from '../dto/mapper/quiz-game.mapper';
import { GamePlayerRoleEnum } from '../types/player-role.enum';
import { QuestionResponseType } from '../types/question-response.type';
import { GameRepository } from '../infrastructure/game/game.repository';
import { GamePlayerRepository } from '../infrastructure/player/game-player.repository';

@Injectable()
export class QuizGameService {
  constructor(
    private gameRepo: GameRepository,
    private gameQueryRepo: GameQwRepository,
    private questionQueryRepo: QuestionQwRepository,
    private playerRepo: GamePlayerRepository,
  ) {}

  async findById(id: string, userId: string): Promise<GameResponseDto> {
    // Получаем game
    const game = await this.gameQueryRepo.findById(id);
    if (!game) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Game Not Found', 'id')],
      });
    }

    // Относится ли пользователь к этой игре
    const firstPlayer = game.gamePlayer.find(
      (p) => p.role === GamePlayerRoleEnum.First,
    );
    const secondPlayer = game.gamePlayer.find(
      (p) => p.role === GamePlayerRoleEnum.Second,
    );
    if (firstPlayer?.userId !== userId && secondPlayer?.userId !== userId) {
      throw new DomainException({
        code: HttpStatus.FORBIDDEN,
        message: 'Forbidden',
        extensions: [new Extension('User Is Not Participant', 'userId')],
      });
    }

    // Если игра ACTIVE то ищем вопросы
    if (
      game.status === QuizGameStatusesEnum.Active ||
      game.status === QuizGameStatusesEnum.Finished
    ) {
      const questions = await this.questionQueryRepo.findQuestionsByIds(
        game.questionIds!,
      );
      const sortedQuestions = game
        .questionIds!.map((q) =>
          questions.find((question) => question.id === q),
        )
        .filter((q): q is QuestionResponseType => !!q);

      return QuizGameMapper.toViewModel(game, sortedQuestions);
    }
    return QuizGameMapper.toViewModel(game);
  }

  async findCurrentGame(userId: string): Promise<GameResponseDto> {
    const game = await this.gameQueryRepo.findCurrentGame(userId);
    if (!game) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Game Not Found', 'id')],
      });
    }

    if (game.status === QuizGameStatusesEnum.Active) {
      const questions = await this.questionQueryRepo.findQuestionsByIds(
        game.questionIds!,
      );
      const sortedQuestions = game
        .questionIds!.map((q) =>
          questions.find((question) => question.id === q),
        )
        .filter((q): q is QuestionResponseType => !!q);

      return QuizGameMapper.toViewModel(game, sortedQuestions);
    }
    return QuizGameMapper.toViewModel(game);
  }

  async awardBonusForFirstCompletion(gameId: string): Promise<void> {
    // Находим игру
    const game = await this.gameRepo.findByIdWithPlayersAndAnswers(gameId);
    if (!game) {
      throw new DomainException({
        code: HttpStatus.FORBIDDEN,
        message: 'Not Found',
        extensions: [
          new Extension('User Is Not Participating In Active Pair', 'userId'),
        ],
      });
    }
    // Первый игрок
    const firstPlayer = game.gamePlayer.find(
      (player) => player.role === GamePlayerRoleEnum.First,
    );
    if (!firstPlayer) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Player 1 Not Found', 'userId')],
      });
    }
    // Второй игрок
    const secondPlayer = game.gamePlayer.find(
      (player) => player.role === GamePlayerRoleEnum.Second,
    );
    if (!secondPlayer) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Player 2 Not Found', 'userId')],
      });
    }

    const firstPlayerLastAnswer = firstPlayer.gamePlayerAnswers
      .reduce((latest, current) =>
        current.addedAt > latest.addedAt ? current : latest,
      )
      .addedAt.getTime();
    if (!firstPlayerLastAnswer) {
      throw new Error('No answers found');
    }
    const secondPlayerLastAnswer = [...secondPlayer.gamePlayerAnswers]
      .reduce((latest, current) =>
        current.addedAt > latest.addedAt ? current : latest,
      )
      .addedAt.getTime();
    if (!secondPlayerLastAnswer) {
      throw new Error('No answers found');
    }

    if (firstPlayerLastAnswer === secondPlayerLastAnswer) return;

    const winner =
      firstPlayerLastAnswer < secondPlayerLastAnswer
        ? firstPlayer
        : secondPlayer;

    if (winner.score > 0) {
      winner.addScore();
      await this.playerRepo.save(winner);
    }
  }
}
