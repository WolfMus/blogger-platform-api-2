import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from '../../modules/blogger-platform/blogs/domain/blog.entity';
import type { BlogModelType } from '../../modules/blogger-platform/blogs/domain/blog.entity';
import { Post } from '../../modules/blogger-platform/posts/domain/post.entity';
import type { PostModelType } from '../../modules/blogger-platform/posts/domain/post.entity';
import { Comment } from '../../modules/blogger-platform/comments/domain/comment.entity';
import type { CommentModelType } from '../../modules/blogger-platform/comments/domain/comment.entity';
import { ApiNoContentResponse } from '@nestjs/swagger';
import { User } from '../../modules/user-accounts/domain/users/mongo/user.entity';
import type { UserModelType } from '../../modules/user-accounts/domain/users/mongo/user.entity';
import {
  Like,
  type LikeModelType,
} from '../../modules/blogger-platform/likes/domain/like.entity';
import {
  Session,
  type SessionModelType,
} from '../../modules/user-accounts/domain/sessions/session.entity';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    @InjectModel(User.name)
    private UserModel: UserModelType,
    @InjectModel(Like.name)
    private LikeModel: LikeModelType,
    @InjectModel(Session.name)
    private SessionModel: SessionModelType,
  ) {}
  @ApiNoContentResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/all-data')
  async deleteAllData(): Promise<void> {
    await this.BlogModel.deleteMany();
    await this.PostModel.deleteMany();
    await this.CommentModel.deleteMany();
    await this.UserModel.deleteMany();
    await this.LikeModel.deleteMany();
    await this.SessionModel.deleteMany();
    return;
  }
}
