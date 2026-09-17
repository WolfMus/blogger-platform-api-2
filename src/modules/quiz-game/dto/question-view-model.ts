import { PaginationInput } from '../../../core/dto/pagination.request.dto';
import { Question } from '../domain/question.entity';
import { QuestionPaginatedResponse } from './question-paginated-view-model';

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

  static mapToPaginatedView(
    questions: Question[],
    paginationInput: PaginationInput,
    totalCount: number,
  ): QuestionPaginatedResponse {
    const pageNumber = paginationInput.pageNumber ?? 1;
    const pageSize = paginationInput.pageSize ?? 10;
    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: totalCount,
      items: questions.map((q) => this.mapToView(q)),
    };
  }
}
