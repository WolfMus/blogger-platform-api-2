import { QuizGameStatusesEnum } from '../../types/quiz-game-status.enum';
import { GamePlayerReadModel } from '../game-player/player.read-model';

export class QuizGameReadModel {
  id: string;
  gamePlayer: GamePlayerReadModel[];
  questionIds: string[] | null;
  status: QuizGameStatusesEnum;
  pairCreatedDate: Date;
  startGameDate: Date | null;
  finishGameDate: Date | null;
}
