import { GamePlayer } from '../../domain/game-players.entity';
import { GamePlayerViewModel } from '../game-player/player-view.dto';

export class GamePlayerMapper {
  static toViewModel(player: GamePlayer): GamePlayerViewModel {
    return {
      id: player.id,
      score: player.score,
      role: player.role,
      userId: player.userId,
      quizGameId: player.quizGameId,
    };
  }

  static mapToViewModel(players: GamePlayer[]): GamePlayerViewModel[] {
    return players.map((p) => this.toViewModel(p));
  }
}
