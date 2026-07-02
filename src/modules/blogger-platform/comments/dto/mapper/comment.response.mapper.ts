import { PaginationInput } from '../../../../../core/dto/pagination.request.dto';
import { LikeStatus } from '../../../posts/domain/post.entity';
import { CommentDocument } from '../../domain/comment.entity';
import { CommentResponseDto } from '../comment.response.dto';
import { PaginatedCommentResponseDto } from '../paginated-comment.response.dto';

export class CommentMapper {
  toResponseView(
    comment: CommentDocument,
    likeStatus: LikeStatus = LikeStatus.None,
  ): CommentResponseDto {
    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: comment.commentatorInfo,
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: comment.likesInfo.likesCount,
        dislikesCount: comment.likesInfo.dislikesCount,
        myStatus: likeStatus,
      },
    };
  }

  toResponsePaginatedView(
    comments: CommentDocument[],
    paginationInput: PaginationInput,
    totalCount: number,
    statusMap: Record<string, LikeStatus> | null = null,
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
          return this.toResponseView(comment);
        }
        const likeStatus = statusMap[comment._id.toString()];
        return this.toResponseView(comment, likeStatus);
      }),
    };
  }
}
