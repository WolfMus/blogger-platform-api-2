import { Injectable } from '@nestjs/common';
import { GameQwRepository } from '../infrastructure/game/game-query.repository';

@Injectable()
export class QuizGameService {
  constructor(private gameQueryRepo: GameQwRepository) {}
  async findById(id: string, userId: string): Promise<void> {
    const game = await this.gameQueryRepo.findById(id);
    if (!game) {
      console.log('Нет игры');
      return;
    }
    console.log('userId: ', userId);
    console.log('Game Players Ids: ', game.gamePlayer[0].userId === userId);
    return;
  }
}
