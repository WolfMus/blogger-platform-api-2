import { AnswerStatusesEnum } from './answer-status.enum';

export type PlayerProgressResponseType = {
  answers: {
    questionId: string;
    answerStatus: AnswerStatusesEnum;
    addedAt: Date;
  }[];
  player: {
    id: string;
    login: string;
  };
  score: number;
};
