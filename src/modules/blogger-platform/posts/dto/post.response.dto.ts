import { LikeStatus } from '../../../../core/types/like-status.enum';
import { NewestLikes } from '../../likes/dto/newest-likes.dto';
import { Post } from '../domain/post.entity';

export class PostResponseDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
    newestLikes: NewestLikes[] | [];
  };

  static mapToView(
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
}
