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
import { GamePlayerRoleEnum } from '../types/player-role.enum';

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
    name: 'role',
    type: 'enum',
    enum: GamePlayerRoleEnum,
    default: GamePlayerRoleEnum.First,
  })
  role: GamePlayerRoleEnum;

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

  @ManyToOne(() => QuizGame, (game) => game.gamePlayer, {
    nullable: true,
    onDelete: 'CASCADE',
  })
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

  addQuizGame(quizGame: QuizGame): void {
    this.quizGame = quizGame;
  }

  changeRole(role: GamePlayerRoleEnum): void {
    this.role = role;
  }
}
