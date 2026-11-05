import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { QuizGame } from '../../domain/quiz-game.entity';
import { QuizGameStatusesEnum } from '../../types/quiz-game-status.enum';
import { Question } from '../../domain/question.entity';
import { QuestionResponseType } from '../../types/question-response.type';
import { GameResponseDto } from '../../dto/game-response.dto';
import { QuizGameMapper } from '../../dto/mapper/quiz-game.mapper';

@Injectable()
export class GameQwRepository {
  constructor(
    @InjectRepository(QuizGame)
    private gameRepo: Repository<QuizGame>,
    @InjectRepository(Question)
    private questionRepo: Repository<Question>,
  ) {}

  async findById(id: string): Promise<GameResponseDto | null> {
    const game = await this.gameRepo.findOne({
      where: { id },
      relations: {
        gamePlayer: {
          user: true,
        },
      },
    });
    if (!game) return null;

    const ids = game.questionIds;
    const raw = await this.questionRepo
      .createQueryBuilder('q')
      .select('q.id', 'id')
      .addSelect('q.body', 'body')
      .where('q.id IN (:...ids)', { ids })
      .getRawMany<QuestionResponseType>();

    if (raw.length !== game.questionIds!.length) {
      throw new Error('Not All Questions Founded');
    }
    return QuizGameMapper.fromEntity(game, raw);
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
