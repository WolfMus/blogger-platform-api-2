import { PlayerProgressResponseType } from '../types/player-progress-response.type';
import { QuestionResponseType } from '../types/question-response.type';
import { QuizGameStatusesEnum } from '../types/quiz-game-status.enum';

export class GameResponseDto {
  id: string;
  firstPlayerProgress: PlayerProgressResponseType;
  secondPlayerProgress: PlayerProgressResponseType | null;
  questions: QuestionResponseType[];
  status: QuizGameStatusesEnum;
  pairCreatedDate: Date;
  startGameDate: Date | null;
  finishGameDate: Date | null;
}
