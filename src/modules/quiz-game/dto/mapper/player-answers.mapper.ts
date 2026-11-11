import { GamePlayerAnswers } from '../../domain/game-answers.entity';
import { AnswerResponseDto } from '../answer/answer-response.dto';
import { AnswersReadModel } from '../answer/answer.read-model';

export class AnswersMapper {
  static toReadModel(answer: GamePlayerAnswers): AnswersReadModel {
    return {
      id: answer.id,
      status: answer.status,
      addedAt: answer.addedAt,
      gamePlayerId: answer.gamePlayerId,
      questionId: answer.questionId,
    };
  }

  static mapToReadModel(answers: GamePlayerAnswers[]) {
    return answers.map((a) => this.toReadModel(a));
  }

  static toViewModel(answer: AnswersReadModel): AnswerResponseDto {
    return {
      questionId: answer.questionId,
      answerStatus: answer.status,
      addedAt: answer.addedAt,
    };
  }

  static mapToViewModel(answers: AnswersReadModel[]) {
    return answers.map((a) => this.toViewModel(a));
  }
}
