import { Injectable } from '@nestjs/common';
import {
  LikeStatus,
  NewestLikes,
  PostDocument,
} from '../../domain/post.entity';
import { PostResponseDto } from '../post.response.dto';
import { PaginationInput } from '../../../../../core/dto/pagination.request.dto';
import { PaginatedPostResponseDto } from '../post-paginated-view.response.dto';
import { PostLikesAgg } from '../../../likes/infrastructure/likes.repository';

@Injectable()
export class PostMapper {
  toResponseView(
    post: PostDocument,
    newestLikes: NewestLikes[] = [],
    likeStatus: LikeStatus = LikeStatus.None,
  ): PostResponseDto {
    return {
      id: post._id.toString(),
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
    posts: PostDocument[],
    paginationInput: PaginationInput,
    totalCount: number,
    likes: PostLikesAgg[] = [],
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
        const postLikes =
          likes.find((l) => l._id.toString() === post._id.toString())
            ?.newestLikes || [];
        if (!statusMap) {
          return this.toResponseView(post, postLikes);
        }
        const likeStatus = statusMap[post._id.toString()];
        return this.toResponseView(post, postLikes, likeStatus);
      }),
    };
  }
}
