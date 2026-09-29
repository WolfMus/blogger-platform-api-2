import { GamePlayerRoleEnum } from '../../types/player-role.enum';

export class GamePlayerViewModel {
  id: string;
  score: number;
  role: GamePlayerRoleEnum;
  userId: string;
  quizGameId: string | null;
}
