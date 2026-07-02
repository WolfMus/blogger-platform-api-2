import { PaginationInput } from '../../../core/dto/pagination.request.dto';

export class UserPaginationRequest extends PaginationInput {
  searchLoginTerm: string | null = null;
  searchEmailTerm: string | null = null;
}
