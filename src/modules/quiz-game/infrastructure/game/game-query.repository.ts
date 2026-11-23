import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { QuizGame } from '../../domain/quiz-game.entity';
import { QuizGameStatusesEnum } from '../../types/quiz-game-status.enum';
import { QuizGameMapper } from '../../dto/mapper/quiz-game.mapper';
import { QuizGameReadModel } from '../../dto/game/game.read-model';
import { SortDirection } from '../../../../core/dto/pagination.request.dto';
import { QuizGamePaginationInput } from '../../types/quiz-pagination.input';

@Injectable()
export class GameQwRepository {
  constructor(
    @InjectRepository(QuizGame)
    private gameRepo: Repository<QuizGame>,
  ) {}

  async findAllByUserId(
    userId: string,
    pagination: QuizGamePaginationInput,
  ): Promise<{ games: QuizGameReadModel[]; totalCount: number }> {
    const sortBy = pagination.sortBy ?? 'pairCreatedDate';
    const sortDirection =
      pagination.sortDirection === SortDirection.Asc ? 'ASC' : 'DESC';
    const pageNumber = pagination.pageNumber ?? 1;
    const pageSize = pagination.pageSize ?? 10;
    const offset = (pageNumber - 1) * pageSize;

    const queryBuilder = this.gameRepo
      .createQueryBuilder('game')
      .innerJoin(
        'game.gamePlayer',
        'currentPlayer',
        'currentPlayer.userId = :userId',
        { userId },
      )
      .leftJoinAndSelect('game.gamePlayer', 'player')
      .leftJoinAndSelect('player.user', 'user')
      .leftJoinAndSelect('player.gamePlayerAnswers', 'answer');

    if (sortBy === 'pairCreatedDate') {
      queryBuilder.orderBy('game.pairCreatedDate', sortDirection);
    } else {
      queryBuilder
        .orderBy(`game.${sortBy}`, sortDirection)
        .addOrderBy('game.pairCreatedDate', 'DESC');
    }

    queryBuilder.skip(offset).take(pageSize);

    const [games, totalCount] = await queryBuilder.getManyAndCount();

    return {
      games: QuizGameMapper.mapToReadModel(games),
      totalCount: totalCount,
    };
  }

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
