import { Injectable } from '@nestjs/common';
import { LikeStatus, Post } from '../../domain/post.entity';
import { PostResponseDto } from '../post.response.dto';
import { PaginationInput } from '../../../../../core/dto/pagination.request.dto';
import { PaginatedPostResponseDto } from '../post-paginated-view.response.dto';
import { PostViewDto } from '../post.view-model.dto';
import { NewestLikes } from '../../../likes/dto/newest-likes.dto';
import { Like } from '../../../likes/domain/like.entity';

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
    post: Post,
    newestLikes: NewestLikes[] = [],
    likeStatus: LikeStatus = LikeStatus.None,
  ): PostResponseDto {
    return {
      id: post.id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blog.id,
      blogName: post.blog.name,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: post.likesCount,
        dislikesCount: post.dislikesCount,
        myStatus: likeStatus,
        newestLikes: newestLikes,
      },
    };
  }

  toResponsePaginatedView(
    posts: Post[],
    paginationInput: PaginationInput,
    totalCount: number,
    likes: Like[] = [],
    statusMap: Like[] | null = null,
    // statusMap: Record<string, LikeStatus> | null = null,
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
          .filter((like) => like.entityId === post.id)
          .map((like) => ({
            addedAt: like.addedAt,
            userId: like.user.id,
            login: like.user.login,
          }));
        if (!statusMap) {
          return this.toResponseView(post, newestLikes);
        }
        const a = statusMap.find((status) => {
          status.id = post.id;
        });
        // const likeStatus = statusMap[post.id.toString()];
        return this.toResponseView(post, newestLikes, a?.likeStatus);
      }),
    };
  }
}
