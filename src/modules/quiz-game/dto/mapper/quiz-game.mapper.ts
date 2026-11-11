import { GamePlayer } from '../../domain/game-players.entity';
import { QuizGame } from '../../domain/quiz-game.entity';
import { GamePlayerRoleEnum } from '../../types/player-role.enum';
import { QuestionResponseType } from '../../types/question-response.type';
import { QuizGameStatusesEnum } from '../../types/quiz-game-status.enum';
import { GamePlayerViewModel } from '../game-player/player-view.dto';
import { GameResponseDto } from '../game-response.dto';
import { QuizGameReadModel } from '../game.read-model';
import { GamePlayerMapper } from './game-player.mapper';

export class QuizGameMapper {
  // Сырой вид из БД
  static toReadModel(game: QuizGame): QuizGameReadModel {
    return {
      id: game.id.toString(),
      gamePlayer: GamePlayerMapper.mapToViewModel(game.gamePlayer),
      questionIds: game.questionIds,
      status: game.status,
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: game.startGameDate,
      finishGameDate: game.finishGameDate,
    };
  }

  static toViewModel(
    game: QuizGameReadModel,
    questions: QuestionResponseType[] = [],
  ): GameResponseDto {
    switch (game.status) {
      case QuizGameStatusesEnum.PendingSecondPlayer:
        return this.toPendingView(game);
      case QuizGameStatusesEnum.Active:
      case QuizGameStatusesEnum.Finished:
        return this.toActiveView(game, questions);
      default:
        throw new Error(`Unknown game status: ${game.status as string}`);
    }
  }

  private static toPendingView(game: QuizGameReadModel): GameResponseDto {
    const firstPlayer = game.gamePlayer.find(
      (p) => p.role === GamePlayerRoleEnum.First,
    );
    return {
      id: game.id.toString(),
      firstPlayerProgress: this.buildPlayer(firstPlayer!),
      secondPlayerProgress: null,
      questions: [],
      status: game.status,
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: game.startGameDate,
      finishGameDate: game.finishGameDate,
    };
  }

  private static toActiveView(
    game: QuizGameReadModel,
    questions: QuestionResponseType[] = [],
  ): GameResponseDto {
    const firstPlayer = game.gamePlayer.find(
      (p) => p.role === GamePlayerRoleEnum.First,
    );
    const secondPlayer = game.gamePlayer.find(
      (p) => p.role === GamePlayerRoleEnum.Second,
    );
    return {
      id: game.id.toString(),
      firstPlayerProgress: this.buildPlayer(firstPlayer!),
      secondPlayerProgress: this.buildPlayer(secondPlayer!),
      questions: questions,
      status: game.status,
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: game.startGameDate,
      finishGameDate: game.finishGameDate,
    };
  }

  private static buildPlayer(player: GamePlayerViewModel) {
    return {
      answers: [],
      player: {
        id: player.userId,
        login: player.userLogin,
      },
      score: player.score,
    };
  }

  // score есть в player => можно убрать лишний параметр
  private static buildPlayerProgress(player: GamePlayer) {
    return {
      answers: [],
      player: {
        id: player.user.id,
        login: player.user.login,
      },
      score: player.score,
    };
  }

  static toMapViewForFirstPlayer(
    game: QuizGame,
    player: GamePlayer,
    questions: QuestionResponseType[],
  ): GameResponseDto {
    return {
      id: game.id.toString(),
      firstPlayerProgress: this.buildPlayerProgress(player),
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
      firstPlayerProgress: this.buildPlayerProgress(firstPlayer),
      secondPlayerProgress: this.buildPlayerProgress(secondPlayer),
      questions: questions,
      status: game.status,
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: game.startGameDate,
      finishGameDate: game.finishGameDate,
    };
  }
}
