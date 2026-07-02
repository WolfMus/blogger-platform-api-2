import { ApiProperty } from '@nestjs/swagger';
import { Pagination } from '../../../../core/dto/pagination.dto';
import { CommentResponseDto } from './comment.response.dto';

export class PaginatedCommentResponseDto extends Pagination {
  @ApiProperty({ type: [CommentResponseDto] })
  items: CommentResponseDto[];
}
