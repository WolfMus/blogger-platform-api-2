import { InjectRepository } from '@nestjs/typeorm';
import { PlayerStatistic } from '../domain/player-statistics.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PlayerStatisticRepository {
  constructor(
    @InjectRepository(PlayerStatistic)
    private statisticRepo: Repository<PlayerStatistic>,
  ) {}

  async findByUserId(userId: string): Promise<PlayerStatistic | null> {
    const statistic = await this.statisticRepo.findOne({
      where: { userId: userId },
      relations: { user: true },
    });
    return statistic ? statistic : null;
  }
}
