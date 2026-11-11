import { GamePlayer } from '../../domain/game-players.entity';
import { PlayerProgressResponseType } from '../../types/player-progress-response.type';
import { GamePlayerReadModel } from '../game-player/player.read-model';
import { AnswersMapper } from './player-answers.mapper';

export class GamePlayerMapper {
  static toReadModel(player: GamePlayer): GamePlayerReadModel {
    return {
      id: player.id,
      score: player.score,
      role: player.role,
      userId: player.userId,
      userLogin: player.user.login,
      quizGameId: player.quizGameId,
      answers: AnswersMapper.mapToReadModel(player.gamePlayerAnswers),
    };
  }

  static mapToReadModel(players: GamePlayer[]): GamePlayerReadModel[] {
    return players.map((p) => this.toReadModel(p));
  }

  static toViewModel(player: GamePlayerReadModel): PlayerProgressResponseType {
    return {
      answers: AnswersMapper.mapToViewModel(player.answers),
      player: {
        id: player.userId,
        login: player.userLogin,
      },
      score: player.score,
    };
  }
}
