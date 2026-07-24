import { Injectable } from '@nestjs/common';
import { LikeStatus, NewestLikes } from '../../domain/post.entity';
import { PostResponseDto } from '../post.response.dto';
import { PaginationInput } from '../../../../../core/dto/pagination.request.dto';
import { PaginatedPostResponseDto } from '../post-paginated-view.response.dto';
import { PostViewDto } from '../post.view-model.dto';
import { LikeRow } from '../../../likes/infrastructure/types/like-row.type';

@Injectable()
export class PostMapper {
  toResponseDtoView(
    post: PostViewDto,
    newestLikes: NewestLikes[] = [],
    likeStatus: LikeStatus = LikeStatus.None,
  ): PostResponseDto {
    return {
      id: post.id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: post.likesCount,
        dislikesCount: post.dislikesCount,
        myStatus: likeStatus,
        newestLikes: newestLikes,
      },
    };
  }

  toResponseView(
    post: PostResponseDto,
    newestLikes: NewestLikes[] = [],
    likeStatus: LikeStatus = LikeStatus.None,
  ): PostResponseDto {
    return {
      id: post.id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: post.extendedLikesInfo.likesCount,
        dislikesCount: post.extendedLikesInfo.dislikesCount,
        myStatus: likeStatus,
        newestLikes: newestLikes,
      },
    };
  }

  toResponsePaginatedView(
    posts: PostResponseDto[],
    paginationInput: PaginationInput,
    totalCount: number,
    likes: LikeRow[] = [],
    statusMap: Record<string, LikeStatus> | null = null,
  ): PaginatedPostResponseDto {
    const pageNumber = paginationInput.pageNumber ?? 1;
    const pageSize = paginationInput.pageSize ?? 10;
    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: totalCount,
      items: posts.map((post) => {
        const newestLikes: NewestLikes[] = likes
          .filter((l) => l.entityId === post.id)
          .map((l) => ({
            addedAt: l.addedAt,
            userId: l.userId,
            login: l.userLogin,
          }));
        if (!statusMap) {
          return this.toResponseView(post, newestLikes);
        }
        const likeStatus = statusMap[post.id.toString()];
        return this.toResponseView(post, newestLikes, likeStatus);
      }),
    };
  }
}
