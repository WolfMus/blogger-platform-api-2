import { AnswerStatusesEnum } from '../../types/answer-status.enum';

export class AnswersReadModel {
  id: string;
  status: AnswerStatusesEnum;
  addedAt: Date;
  gamePlayerId: string;
  questionId: string;
}
