import { PaginationInput } from '../../../core/dto/pagination.request.dto';

export class QuizGamePaginationInput extends PaginationInput {
  sortBy: string = 'pairCreatedDate';
}
