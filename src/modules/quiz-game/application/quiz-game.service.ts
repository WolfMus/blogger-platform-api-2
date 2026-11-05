import { HttpStatus, Injectable } from '@nestjs/common';
import { GameQwRepository } from '../infrastructure/game/game-query.repository';
import {
  DomainException,
  Extension,
} from '../../../core/exceptions/domain-exception';
import { QuestionQwRepository } from '../infrastructure/question/question-query.repository';

@Injectable()
export class QuizGameService {
  constructor(
    private gameQueryRepo: GameQwRepository,
    private questionRepo: QuestionQwRepository,
  ) {}

  async findById(id: string, userId: string): Promise<unknown> {
    const game = await this.gameQueryRepo.findById(id);
    console.log(game);
    if (!game) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Game Not Found', 'id')],
      });
    }

    // Относится ли пользователь к этой игре
    //if (game.gamePlayer.some((p) => p.userId === userId)) {
    //  throw new DomainException({
    //    code: HttpStatus.FORBIDDEN,
    //    message: 'Forbidden',
    //    extensions: [new Extension('User Is Not Participant', 'userId')],
    //  });
    //}
//
    //const questions = await this.questionRepo.findQuestionsByIds(
    //  game.questionIds!,
    //);
    //console.log(questions);

    return;
  }
}

/**
 * Получить id игры
 * Проверить участвует ли пользователь в игре
 * Проверить сколько участников в игре
 */
