import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { QuizGame } from '../../domain/quiz-game.entity';
import { QuizGameStatusesEnum } from '../../types/quiz-game-status.enum';

@Injectable()
export class GameQwRepository {
  constructor(
    @InjectRepository(QuizGame)
    private gameRepo: Repository<QuizGame>,
  ) {}

  async findById(id: string): Promise<QuizGame | null> {
    const game = await this.gameRepo.findOne({
      where: { id },
      relations: { gamePlayer: true },
    });
    if (!game) return null;
    return game;
  }

  async existsByUserId(userId: string): Promise<boolean> {
    const count = await this.gameRepo.count({
      where: {
        gamePlayer: { userId: userId },
        status: In([
          QuizGameStatusesEnum.Active,
          QuizGameStatusesEnum.PendingSecondPlayer,
        ]),
      },
    });
    return count > 0;
  }
}
