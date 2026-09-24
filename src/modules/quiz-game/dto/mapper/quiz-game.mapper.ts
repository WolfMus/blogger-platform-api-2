import { GamePlayer } from '../../domain/game-players.entity';
import { QuizGame } from '../../domain/quiz-game.entity';
import { QuestionResponseType } from '../../types/question-response.type';
import { GameResponseDto } from '../game-response.dto';

export class QuizGameMapper {
  static buildPlayerProgress(player: GamePlayer, score: number) {
    return {
      answers: [],
      player: {
        id: player.user.id,
        login: player.user.login,
      },
      score: score,
    };
  }

  static toMapViewForFirstPlayer(
    game: QuizGame,
    player: GamePlayer,
    questions: QuestionResponseType[],
  ): GameResponseDto {
    return {
      id: game.id.toString(),
      firstPlayerProgress: this.buildPlayerProgress(player, 0),
      secondPlayerProgress: null,
      questions: questions,
      status: game.status,
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: game.startGameDate,
      finishGameDate: game.finishGameDate,
    };
  }

  static toMapViewForSecondPlayer(
    game: QuizGame,
    firstPlayer: GamePlayer,
    secondPlayer: GamePlayer,
    questions: QuestionResponseType[],
  ): GameResponseDto {
    return {
      id: game.id.toString(),
      firstPlayerProgress: this.buildPlayerProgress(firstPlayer, 0),
      secondPlayerProgress: this.buildPlayerProgress(secondPlayer, 0),
      questions: questions,
      status: game.status,
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: game.startGameDate,
      finishGameDate: game.finishGameDate,
    };
  }
}
