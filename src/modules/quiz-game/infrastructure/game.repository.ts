import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { QuizGame } from '../domain/quiz-game.entity';
import { QuizGameStatusesEnum } from '../types/quiz-game-status.enum';

@Injectable()
export class GameRepository {
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

  async findPendingGame(): Promise<QuizGame | null> {
    const game = await this.gameRepo.findOne({
      where: {
        status: QuizGameStatusesEnum.PendingSecondPlayer,
      },
      order: {
        pairCreatedDate: 'ASC',
      },
      relations: { gamePlayer: true },
    });
    return game ? game : null;
  }

  async isActiveGameExist(userId: string): Promise<boolean> {
    const game = await this.gameRepo.findOne({
      where: {
        gamePlayer: { userId: userId },
        status: In([
          QuizGameStatusesEnum.Active,
          QuizGameStatusesEnum.PendingSecondPlayer,
        ]),
      },
    });
    return game ? true : false;
  }

  async save(game: QuizGame): Promise<QuizGame> {
    const saved = await this.gameRepo.save(game);
    return saved;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.gameRepo.delete({ id: id });
    return deleted.affected === 1;
  }
}
