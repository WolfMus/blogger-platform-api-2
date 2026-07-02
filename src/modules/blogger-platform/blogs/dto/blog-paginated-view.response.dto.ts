import { ApiProperty } from '@nestjs/swagger';
import { Pagination } from '../../../../core/dto/pagination.dto';
import { BlogResponseDto } from './blog-response.dto';

export class PaginatedBlogResponseDto extends Pagination {
  @ApiProperty({ type: [BlogResponseDto] })
  items: BlogResponseDto[];
}
