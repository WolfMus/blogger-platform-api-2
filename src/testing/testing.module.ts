import { TestingController } from './api/testing.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Blog,
  BlogSchema,
} from '../modules/blogger-platform/blogs/domain/blog.entity';
import {
  Comment,
  CommentSchema,
} from '../modules/blogger-platform/comments/domain/comment.entity';
import {
  Post,
  PostSchema,
} from '../modules/blogger-platform/posts/domain/post.entity';
import { Module } from '@nestjs/common';
import {
  Like,
  LikeSchema,
} from '../modules/blogger-platform/likes/domain/like.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from '../modules/user-accounts/domain/sessions/session.entity';
import { UserPostgres } from '../modules/user-accounts/domain/users/postgresql/user.postgres.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Like.name, schema: LikeSchema },
    ]),
    TypeOrmModule.forFeature([UserPostgres, Session]),
  ],
  controllers: [TestingController],
})
export class TestingModule {}
