import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AnswerStatusesEnum } from '../types/answer-status.enum';
import { GamePlayer } from './game-players.entity';
import { Question } from './question.entity';

@Entity({ name: 'gamePlayerAnswers' })
export class GamePlayerAnswers {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: AnswerStatusesEnum,
  })
  status: AnswerStatusesEnum;

  @CreateDateColumn({ name: 'addedAt' })
  addedAt: Date;

  @Column({ name: 'gamePlayerId', type: 'uuid' })
  gamePlayerId: string;

  @ManyToOne(() => GamePlayer, (player) => player.gamePlayerAnswers)
  @JoinColumn({ name: 'gamePlayerId' })
  gamePlayer: GamePlayer;

  @Column({ name: 'questionId', type: 'uuid' })
  questionId: string;

  @ManyToOne(() => Question, (question) => question.gamePlayerAnswers)
  @JoinColumn({ name: 'questionId' })
  question: Question;
}
