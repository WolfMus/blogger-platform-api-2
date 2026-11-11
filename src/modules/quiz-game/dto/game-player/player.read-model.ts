import { GamePlayerRoleEnum } from '../../types/player-role.enum';
import { AnswersReadModel } from '../answer/answer.read-model';

export class GamePlayerReadModel {
  id: string;
  score: number;
  role: GamePlayerRoleEnum;
  userId: string;
  userLogin: string;
  quizGameId: string | null;
  answers: AnswersReadModel[];
}
