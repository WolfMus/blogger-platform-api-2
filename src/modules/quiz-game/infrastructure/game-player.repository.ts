import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { GamePlayer } from '../domain/game-players.entity';

@Injectable()
export class GamePlayerRepository {
  constructor(
    @InjectRepository(GamePlayer)
    private gamePlayerRepo: Repository<GamePlayer>,
  ) {}

  async findById(id: string): Promise<GamePlayer | null> {
    const player = await this.gamePlayerRepo.findOne({ where: { id } });
    if (!player) return null;
    return player;
  }

  async findByUserId(userId: string): Promise<GamePlayer | null> {
    const player = await this.gamePlayerRepo.findOne({
      where: { userId: userId },
      relations: { user: true },
    });
    if (!player) return null;
    return player;
  }

  async save(player: GamePlayer): Promise<GamePlayer | null> {
    const saved = await this.gamePlayerRepo.save(player);
    return saved;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.gamePlayerRepo.delete({ id: id });
    return deleted.affected === 1;
  }
}
