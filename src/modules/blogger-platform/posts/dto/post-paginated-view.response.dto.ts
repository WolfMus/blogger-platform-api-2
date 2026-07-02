import { ApiProperty } from '@nestjs/swagger';
import { Pagination } from '../../../../core/dto/pagination.dto';
import { PostResponseDto } from './post.response.dto';

export class PaginatedPostResponseDto extends Pagination {
  @ApiProperty({ type: [PostResponseDto] })
  items: PostResponseDto[];
}
