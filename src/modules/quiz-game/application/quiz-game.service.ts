import { HttpStatus, Injectable } from '@nestjs/common';
import { GameQwRepository } from '../infrastructure/game/game-query.repository';
import {
  DomainException,
  Extension,
} from '../../../core/exceptions/domain-exception';
import { GameResponseDto } from '../dto/game-response.dto';

@Injectable()
export class QuizGameService {
  constructor(private gameQueryRepo: GameQwRepository) {}

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
    console.log(game);
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
    // Ищем игру, где
    //            playerId === userId && status !== Finished
    // Возвращаем
    // Если игры нет => 404
  }
}
