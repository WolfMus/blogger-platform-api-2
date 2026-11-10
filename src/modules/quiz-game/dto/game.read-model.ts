import { QuizGameStatusesEnum } from '../types/quiz-game-status.enum';
import { GamePlayerViewModel } from './game-player/player-view.dto';

export class QuizGameReadModel {
  id: string;
  gamePlayer: GamePlayerViewModel[];
  questionIds: string[] | null;
  status: QuizGameStatusesEnum;
  pairCreatedDate: Date;
  startGameDate: Date | null;
  finishGameDate: Date | null;
}
