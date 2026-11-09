import { GamePlayer } from '../../domain/game-players.entity';
import { QuizGame } from '../../domain/quiz-game.entity';
import { QuestionResponseType } from '../../types/question-response.type';
import { QuizGameStatusesEnum } from '../../types/quiz-game-status.enum';
import { GameResponseDto } from '../game-response.dto';

export class QuizGameMapper {
  static fromEntity(
    game: QuizGame,
    questions: QuestionResponseType[],
  ): GameResponseDto {
    switch (game.status) {
      case QuizGameStatusesEnum.PendingSecondPlayer:
        return this.toPendingView(game);
      case QuizGameStatusesEnum.Active:
        return this.toActiveView(game, questions);
      default: {
        throw new Error(`Unknown game status: ${game.status}`);
      }
    }
  }

  static toPendingView(game: QuizGame): GameResponseDto {
    return {
      id: game.id.toString(),
      firstPlayerProgress: this.buildPlayerProgress(game.gamePlayer[0], 0),
      secondPlayerProgress: null,
      questions: [],
      status: game.status,
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: null,
      finishGameDate: null,
    };
  }

  static toActiveView(
    game: QuizGame,
    questions: QuestionResponseType[],
  ): GameResponseDto {
    console.log(game.gamePlayer.length);
    return {
      id: game.id.toString(),
      firstPlayerProgress: this.buildPlayerProgress(
        game.gamePlayer[0],
        game.gamePlayer[0].score,
      ),
      secondPlayerProgress: this.buildPlayerProgress(
        game.gamePlayer[1],
        game.gamePlayer[1].score,
      ),
      questions: questions,
      status: game.status,
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: game.startGameDate,
      finishGameDate: game.finishGameDate,
    };
  }

  // score есть в player => можно убрать лишний параметр
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
