import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user-accounts/domain/users/user.entity';
import { QuizGame } from './quiz-game.entity';
import { GamePlayerAnswers } from './game-answers.entity';

@Entity({ name: 'gamePlayers' })
export class GamePlayer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'score',
    type: 'smallint',
    default: 0,
  })
  score: number;

  @Column({
    name: 'userId',
    type: 'uuid',
    nullable: false,
  })
  userId: string;

  @ManyToOne(() => User, (user) => user.gamePlayers)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    name: 'quizGameId',
    type: 'uuid',
    nullable: true,
  })
  quizGameId: string | null;

  @ManyToOne(() => QuizGame, (game) => game.gamePlayer, { nullable: true })
  @JoinColumn({ name: 'quizGameId' })
  quizGame: QuizGame | null;

  @OneToMany(() => GamePlayerAnswers, (answer) => answer.gamePlayer)
  gamePlayerAnswers: GamePlayerAnswers[];

  static createInstance(userId: string): GamePlayer {
    const player = new GamePlayer();
    player.userId = userId;
    player.quizGame = null;
    return player;
  }
}
