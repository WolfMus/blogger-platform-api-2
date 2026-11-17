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

@Injectable()
export class QuizGameService {
  constructor(
    private gameQueryRepo: GameQwRepository,
    private questionQueryRepo: QuestionQwRepository,
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
      return QuizGameMapper.toViewModel(game, questions);
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
      return QuizGameMapper.toViewModel(game, questions);
    }
    return QuizGameMapper.toViewModel(game);
  }
}
