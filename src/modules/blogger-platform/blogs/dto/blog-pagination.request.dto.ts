import { PaginationInput } from '../../../../core/dto/pagination.request.dto';

export class BlogPaginationRequest extends PaginationInput {
  searchNameTerm: string | null = null;
}
