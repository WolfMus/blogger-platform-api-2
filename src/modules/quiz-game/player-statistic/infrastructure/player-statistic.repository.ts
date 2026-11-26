import { InjectRepository } from '@nestjs/typeorm';
import { PlayerStatistic } from '../domain/player-statistics.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PlayerStatisticRepository {
  constructor(
    @InjectRepository(PlayerStatistic)
    private statsRepo: Repository<PlayerStatistic>,
  ) {}

  async findByUserId(userId: string): Promise<PlayerStatistic | null> {
    const statistic = await this.statsRepo.findOne({
      where: { userId: userId },
      relations: { user: true },
    });
    return statistic ? statistic : null;
  }

  async incrementStats(
    userId: string,
    score: number,
    gameResult: 'win' | 'loss' | 'draw',
  ): Promise<void> {
    const updateResult = await this.statsRepo
      .createQueryBuilder()
      .update(PlayerStatistic)
      .set({
        sumScore: () => `"sumScore" + ${score}`,
        gamesCount: () => '"gamesCount" + 1',
        avgScores: () => '"sumScore" / "gamesCount"',
        winsCount:
          gameResult === 'win' ? () => '"winsCount" + 1' : () => '"winsCount"',
        lossesCount:
          gameResult === 'loss'
            ? () => '"lossesCount" + 1'
            : () => '"lossesCount"',
        drawsCount:
          gameResult === 'draw'
            ? () => '"drawsCount" + 1'
            : () => '"drawsCount"',
      })
      .where('userId = :userId', { userId })
      .execute();

    if (updateResult.affected === 0) {
      const playerStats = PlayerStatistic.createInstance({
        userId,
        sumScore: score,
        gamesCount: 1,
        winsCount: gameResult === 'win' ? 1 : 0,
        lossesCount: gameResult === 'loss' ? 1 : 0,
        drawsCount: gameResult === 'draw' ? 1 : 0,
      });
      await this.statsRepo.save(playerStats);
    }
  }
}
