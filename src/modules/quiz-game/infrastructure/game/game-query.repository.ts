import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { QuizGame } from '../../domain/quiz-game.entity';
import { QuizGameStatusesEnum } from '../../types/quiz-game-status.enum';
import { QuizGameMapper } from '../../dto/mapper/quiz-game.mapper';
import { QuizGameReadModel } from '../../dto/game/game.read-model';

@Injectable()
export class GameQwRepository {
  constructor(
    @InjectRepository(QuizGame)
    private gameRepo: Repository<QuizGame>,
  ) {}

  async findById(id: string): Promise<QuizGameReadModel | null> {
    const game = await this.gameRepo.findOne({
      where: { id },
      relations: {
        gamePlayer: {
          user: true,
          gamePlayerAnswers: true,
        },
      },
    });
    if (!game) return null;
    return QuizGameMapper.toReadModel(game);
  }

  async findCurrentGame(userId: string): Promise<QuizGameReadModel | null> {
    const game = await this.gameRepo
      .createQueryBuilder('game')
      .innerJoin(
        'game.gamePlayer',
        'currentPlayer',
        'currentPlayer.userId = :userId',
        { userId },
      )
      .leftJoinAndSelect('game.gamePlayer', 'player')
      .leftJoinAndSelect('player.user', 'user')
      .leftJoinAndSelect('player.gamePlayerAnswers', 'answer')
      .where('game.status != :finished', {
        finished: QuizGameStatusesEnum.Finished,
      })
      .getOne();

    if (!game) return null;
    // const gameRecord = await this.gameRepo.findOne({
    //   where: {
    //     gamePlayer: { userId: userId },
    //     status: Not(QuizGameStatusesEnum.Finished),
    //   },
    //   select: { id: true },
    // });
    // if (!gameRecord) return null;
    // const gameId = gameRecord.id;

    // const game = await this.gameRepo.findOne({
    //   where: { id: gameId },
    //   relations: { gamePlayer: { user: true, gamePlayerAnswers: true } },
    // });
    // if (!game) return null;

    return QuizGameMapper.toReadModel(game);
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
