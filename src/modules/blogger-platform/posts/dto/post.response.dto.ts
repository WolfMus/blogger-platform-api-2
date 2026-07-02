import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import {
  ExtendedLikesInfo,
  LikeStatus,
  NewestLikes,
  PostDocument,
} from '../domain/post.entity';

@ApiSchema({ name: 'PostResponseDto' })
export class PostResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  shortDescription: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  blogId: string;

  @ApiProperty()
  blogName: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: ExtendedLikesInfo })
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
    newestLikes: NewestLikes[] | [];
  };

  static mapToView(
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
}
