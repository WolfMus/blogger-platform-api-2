import { HttpStatus, Injectable } from '@nestjs/common';
import { PlayerStatisticRepository } from '../infrastructure/player-statistic.repository';
import {
  DomainException,
  Extension,
} from '../../../../core/exceptions/domain-exception';
import { PlayerStatisticResponseDto } from '../dto/statistic-response.dto';
import { GameQwRepository } from '../../infrastructure/game/game-query.repository';
import { GamePlayerRoleEnum } from '../../types/player-role.enum';

@Injectable()
export class PlayerStatisticService {
  constructor(
    private playerStatisticRepo: PlayerStatisticRepository,
    private gameRepo: GameQwRepository,
  ) {}

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
      avgScores: statistic.avgScores,
      gamesCount: statistic.gamesCount,
      winsCount: statistic.winsCount,
      lossesCount: statistic.lossesCount,
      drawsCount: statistic.drawsCount,
    };
  }

  async updateStatisticAfterGameFinished(gameId: string): Promise<void> {
    const game = await this.gameRepo.findById(gameId);
    if (!game) {
      throw new DomainException({
        code: HttpStatus.FORBIDDEN,
        message: 'Not Found',
        extensions: [new Extension('Game Not Found', 'gameId')],
      });
    }

    // Поиск игроков
    const firstPlayer = game.gamePlayer.find(
      (p) => p.role === GamePlayerRoleEnum.First,
    );
    const secondPlayer = game.gamePlayer.find(
      (p) => p.role === GamePlayerRoleEnum.Second,
    );
    if (!firstPlayer || !secondPlayer) {
      throw new DomainException({
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Game is missing players',
        extensions: [new Extension('Players Not Found', 'game')],
      });
    }

    const firstPlayerResult = this.getResult(
      firstPlayer.score,
      secondPlayer.score,
    );
    const secondPlayerScore = this.getResult(
      secondPlayer.score,
      firstPlayer.score,
    );

    await this.playerStatisticRepo.incrementStats(
      firstPlayer.userId,
      firstPlayer.score,
      firstPlayerResult,
    );
    await this.playerStatisticRepo.incrementStats(
      secondPlayer.userId,
      secondPlayer.score,
      secondPlayerScore,
    );
  }

  private getResult(
    currentScore: number,
    enemyScore: number,
  ): 'win' | 'loss' | 'draw' {
    if (currentScore > enemyScore) return 'win';
    if (currentScore < enemyScore) return 'loss';
    return 'draw';
  }
}
