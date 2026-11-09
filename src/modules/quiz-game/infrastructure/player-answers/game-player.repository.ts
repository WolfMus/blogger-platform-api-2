import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { GamePlayerAnswers } from '../../domain/game-answers.entity';

@Injectable()
export class GamePlayerAnswersRepository {
  constructor(
    @InjectRepository(GamePlayerAnswers)
    private playerAnswersRepo: Repository<GamePlayerAnswers>,
  ) {}

  async findById(id: string): Promise<GamePlayerAnswers | null> {
    const player = await this.playerAnswersRepo.findOne({
      where: { id },
      relations: {
        question: true,
        gamePlayer: true,
      },
    });
    if (!player) return null;
    return player;
  }

  async save(playerAnswer: GamePlayerAnswers): Promise<GamePlayerAnswers> {
    const saved = await this.playerAnswersRepo.save(playerAnswer);
    return saved;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.playerAnswersRepo.delete({ id: id });
    return deleted.affected === 1;
  }
}
