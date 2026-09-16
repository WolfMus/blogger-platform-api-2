import { Question } from '../domain/question.entity';

export class QuestionViewModel {
  id: string;
  body: string;
  correctAnswers: string[];
  publish: boolean;
  createdAt: Date;
  updatedAt: Date;

  static mapToView(question: Question): QuestionViewModel {
    return {
      id: question.id.toString(),
      body: question.body,
      correctAnswers: question.correctAnswers,
      publish: question.published,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    };
  }
}
