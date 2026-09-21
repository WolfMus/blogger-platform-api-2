import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QuizGameStatusesEnum } from '../types/quiz-game-status.enum';
import { GamePlayer } from './game-players.entity';

@Entity({ name: 'quizGames' })
export class QuizGame {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: QuizGameStatusesEnum,
    default: QuizGameStatusesEnum.PendingSecondPlayer,
  })
  status: QuizGameStatusesEnum;

  @Column({
    name: 'questionIds',
    type: 'uuid',
    array: true,
    nullable: true,
    default: null,
  })
  questionIds: string[] | null;

  @CreateDateColumn({ name: 'pairCreatedDate' })
  pairCreatedDate: Date;

  @Column({
    name: 'startGameDate',
    type: 'timestamptz',
    nullable: true,
    default: null,
  })
  startGameDate: Date | null;

  @Column({
    name: 'finishGameDate',
    type: 'timestamptz',
    nullable: true,
    default: null,
  })
  finishGameDate: Date | null;

  @OneToMany(() => GamePlayer, (player) => player.quizGame)
  gamePlayer: GamePlayer[];

  static createInstance(): QuizGame {
    const game = new QuizGame();
    return game;
  }

  addQuestionIds(questionIds: string[]): void {
    this.questionIds = questionIds;
  }
}
