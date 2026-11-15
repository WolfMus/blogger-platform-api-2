import { Injectable } from '@nestjs/common';
import { GamePlayerReadModel } from '../../dto/game-player/player.read-model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GamePlayer } from '../../domain/game-players.entity';
import { GamePlayerMapper } from '../../dto/mapper/game-player.mapper';

@Injectable()
export class GamePlayerQwRepository {
  constructor(
    @InjectRepository(GamePlayer)
    private playerRepo: Repository<GamePlayer>,
  ) {}

  async findById(id: string): Promise<GamePlayerReadModel | null> {
    const player = await this.playerRepo.findOne({ where: { id } });
    if (!player) return null;
    return GamePlayerMapper.toReadModel(player);
  }

  async findByUserId(userId: string): Promise<GamePlayerReadModel | null> {
    const player = await this.playerRepo.findOne({ where: { userId } });
    if (!player) return null;
    return GamePlayerMapper.toReadModel(player);
  }

  async findByUserIdAndGameId(
    userId: string,
    gameId: string,
  ): Promise<GamePlayerReadModel | null> {
    const player = await this.playerRepo.findOne({
      where: { userId, quizGameId: gameId },
      relations: { gamePlayerAnswers: true },
    });
    if (!player) return null;
    return GamePlayerMapper.toReadModel(player);
  }
}
