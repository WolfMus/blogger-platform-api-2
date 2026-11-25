import { HttpStatus, Injectable } from '@nestjs/common';
import { PlayerStatisticRepository } from '../infrastructure/player-statistic.repository';
import {
  DomainException,
  Extension,
} from '../../../../core/exceptions/domain-exception';
import { PlayerStatisticResponseDto } from '../dto/statistic-response.dto';

@Injectable()
export class PlayerStatisticService {
  constructor(private playerStatisticRepo: PlayerStatisticRepository) {}

  async findMyStatistic(userId: string): Promise<PlayerStatisticResponseDto> {
    const statistic = await this.playerStatisticRepo.findByUserId(userId);
    if (!statistic) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('User Statistic Not Found', 'userId')],
      });
    }
    return {
      sumScore: statistic.sumScore,
      avgScores: statistic.sumScore / statistic.gamesCount,
      gamesCount: statistic.gamesCount,
      winsCount: statistic.winsCount,
      lossesCount: statistic.lossesCount,
      drawsCount: statistic.drawsCount,
    };
  }
}
