import { HttpStatus, Injectable } from '@nestjs/common';
import { GameQwRepository } from '../infrastructure/game/game-query.repository';
import {
  DomainException,
  Extension,
} from '../../../core/exceptions/domain-exception';
import { GamePlayerQwRepository } from '../infrastructure/player/game-player-query.repository';
import { QuestionQwRepository } from '../infrastructure/question/question-query.repository';
import { QuizGameMapper } from '../dto/mapper/quiz-game.mapper';

@Injectable()
export class QuizGameService {
  constructor(
    private gameQueryRepo: GameQwRepository,
    private playerQueryRepo: GamePlayerQwRepository,
    private questionRepo: QuestionQwRepository,
  ) {}

  async findById(id: string, userId: string): Promise<unknown> {
    // Поиск игрока
    const player = await this.playerQueryRepo.findByUserId(userId);
    if (!player) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Player Not Found', 'id')],
      });
    }

    // Поиск игры
    const game = await this.gameQueryRepo.findById(id);
    if (!game) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Game Not Found', 'id')],
      });
    }

    // Относится ли пользователь к этой игре
    if (
      game.gamePlayer[0].userId !== userId ||
      game.gamePlayer[1].userId !== userId
    ) {
      throw new DomainException({
        code: HttpStatus.FORBIDDEN,
        message: 'Forbidden',
        extensions: [new Extension('User Is Not Participant', 'userId')],
      });
    }

    const questions = await this.questionRepo.findQuestionsByIds(
      game.questionIds!,
    );

    return QuizGameMapper.toViewModel(game, questions);
  }
}

/**
 * Получить id игры
 * Проверить участвует ли пользователь в игре
 * Проверить сколько участников в игре
 */
