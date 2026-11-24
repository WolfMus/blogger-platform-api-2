import { Injectable } from '@nestjs/common';
import { PlayerStatisticRepository } from '../infrastructure/player-statistic.repository';

@Injectable()
export class PlayerStatisticService {
  constructor(private playerStatisticRepo: PlayerStatisticRepository) {}

  async findMyStatistic(userId: string): Promise<void> {}
}
