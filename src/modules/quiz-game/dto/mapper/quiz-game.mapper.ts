import { GamePlayer } from '../../domain/game-players.entity';
import { QuizGame } from '../../domain/quiz-game.entity';
import { QuestionResponseType } from '../../types/question-response.type';
import { GameResponseDto } from '../game-response.dto';

export class QuizGameMapper {
  static toMapView(
    game: QuizGame,
    player: GamePlayer,
    questions: QuestionResponseType[],
  ): GameResponseDto {
    return {
      id: game.id.toString(),
      firstPlayerProgress: {
        answers: [],
        player: {
          id: player.user.id,
          login: player.user.login,
        },
        score: 0,
      },
      secondPlayerProgress: null,
      questions: questions,
      status: game.status,
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: game.startGameDate,
      finishGameDate: game.finishGameDate,
    };
  }
}
