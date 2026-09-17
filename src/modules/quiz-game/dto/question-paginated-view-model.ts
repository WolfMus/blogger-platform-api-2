import { Pagination } from '../../../core/dto/pagination.dto';
import { QuestionViewModel } from './question-view-model';

export class QuestionPaginatedResponse extends Pagination {
  items: QuestionViewModel[];
}
