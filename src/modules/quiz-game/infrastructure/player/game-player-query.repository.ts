import { Injectable } from '@nestjs/common';
import { GamePlayerViewModel } from '../../dto/game-player/player-view.dto';
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

  async findById(id: string): Promise<GamePlayerViewModel | null> {
    const player = await this.playerRepo.findOne({ where: { id } });
    if (!player) return null;
    return GamePlayerMapper.toViewModel(player);
  }

  async findByUserId(userId: string): Promise<GamePlayerViewModel | null> {
    const player = await this.playerRepo.findOne({ where: { userId } });
    if (!player) return null;
    return GamePlayerMapper.toViewModel(player);
  }
}
