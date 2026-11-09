import { HttpStatus, Injectable } from '@nestjs/common';
import { GameQwRepository } from '../infrastructure/game/game-query.repository';
import {
  DomainException,
  Extension,
} from '../../../core/exceptions/domain-exception';
import { GameResponseDto } from '../dto/game-response.dto';
import { AnswerResponseDto } from '../dto/answer-response.dto';
import { QuizGameStatusesEnum } from '../types/quiz-game-status.enum';
import { GamePlayerQwRepository } from '../infrastructure/player/game-player-query.repository';

@Injectable()
export class QuizGameService {
  constructor(
    private gameQueryRepo: GameQwRepository,
    private playerQueryRepo: GamePlayerQwRepository,
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
    const firstPlayerId = game.firstPlayerProgress.player.id;
    const secondPlayerId = game.secondPlayerProgress?.player.id;
    if (firstPlayerId !== userId && secondPlayerId !== userId) {
      throw new DomainException({
        code: HttpStatus.FORBIDDEN,
        message: 'Forbidden',
        extensions: [new Extension('User Is Not Participant', 'userId')],
      });
    }

    return game;
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
    return game;
  }

  async sendAnswer(userId: string, answer: string): Promise<void> {
    // Поиск игры
    const game = await this.gameQueryRepo.findCurrentGame(userId);
    if (!game) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Game Not Found', 'id')],
      });
    }

    // Игра в статусе ACTIVE?
    if (game.status !== QuizGameStatusesEnum.Active) {
      throw new DomainException({
        code: HttpStatus.FORBIDDEN,
        message: 'Forbidden',
        extensions: [new Extension('User Is Not Participant', 'userId')],
      });
    }

    // Относится ли пользователь к этой игре
    const firstPlayerId = game.firstPlayerProgress.player.id;
    const secondPlayerId = game.secondPlayerProgress?.player.id;
    if (firstPlayerId !== userId && secondPlayerId !== userId) {
      throw new DomainException({
        code: HttpStatus.FORBIDDEN,
        message: 'Forbidden',
        extensions: [new Extension('User Is Not Participant', 'userId')],
      });
    }

    // Ищем пользователя по gameId & userId
    const player = await this.playerQueryRepo.findByUserIdAndGameId(
      userId,
      game.id,
    );
    if (!player) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Player Not Found', 'id')],
      });
    }
  }
}

/**
 *         403
 * user not PARTICIPANT
 * user not in ACTIVE pair
 * user ANSWERED ALL QUESTIONS
 */
