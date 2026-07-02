import { ApiProperty } from '@nestjs/swagger';
import { Pagination } from '../../../core/dto/pagination.dto';
import { UserResponseDto } from './user.response.dto';

export class PaginatedUserResponseDto extends Pagination {
  @ApiProperty({ type: [UserResponseDto] })
  items: UserResponseDto[];
}
