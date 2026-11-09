import { AnswerStatusesEnum } from '../types/answer-status.enum';

export class AnswerResponseDto {
  questionId: string;
  answerStatus: AnswerStatusesEnum;
  addedAt: Date;
}
