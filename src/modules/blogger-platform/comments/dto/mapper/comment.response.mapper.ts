import { PaginationInput } from '../../../../../core/dto/pagination.request.dto';
import { LikeStatus } from '../../../../../core/types/like-status.enum';
import { Like } from '../../../likes/domain/like.entity';
import { Comment } from '../../domain/comment.entity';
import { CommentResponseDto } from '../comment.response.dto';
import { PaginatedCommentResponseDto } from '../paginated-comment.response.dto';

export class CommentMapper {
  toResponsePostgresView(
    comment: Comment,
    likeStatus: LikeStatus = LikeStatus.None,
  ): CommentResponseDto {
    return {
      id: comment.id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.user.id,
        userLogin: comment.user.login,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: comment.likesCount,
        dislikesCount: comment.dislikesCount,
        myStatus: likeStatus,
      },
    };
  }

  toResponsePaginatedPostgresView(
    comments: Comment[],
    paginationInput: PaginationInput,
    totalCount: number,
    statusMap: Like[] | null = null,
  ): PaginatedCommentResponseDto {
    const pageNumber = paginationInput.pageNumber ?? 1;
    const pageSize = paginationInput.pageSize ?? 10;
    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: totalCount,
      items: comments.map((comment) => {
        if (!statusMap) {
          return this.toResponsePostgresView(comment);
        }
        const a = statusMap.find((status) => {
          status.id = comment.id;
        });
        // const likeStatus = statusMap[comment.id.toString()];
        return this.toResponsePostgresView(comment, a?.likeStatus);
      }),
    };
  }
}
