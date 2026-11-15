export class QuestionViewModel {
  id: string;
  body: string;
  correctAnswers: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}
