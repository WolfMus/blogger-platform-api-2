import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from '../../modules/blogger-platform/blogs/domain/blog.entity';
import type { BlogModelType } from '../../modules/blogger-platform/blogs/domain/blog.entity';
import { Post } from '../../modules/blogger-platform/posts/domain/post.entity';
import type { PostModelType } from '../../modules/blogger-platform/posts/domain/post.entity';
import { Comment } from '../../modules/blogger-platform/comments/domain/comment.entity';
import type { CommentModelType } from '../../modules/blogger-platform/comments/domain/comment.entity';
import { ApiNoContentResponse } from '@nestjs/swagger';
import {
  Like,
  type LikeModelType,
} from '../../modules/blogger-platform/likes/domain/like.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    @InjectModel(Like.name)
    private LikeModel: LikeModelType,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}
  @ApiNoContentResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/all-data')
  async deleteAllData(): Promise<void> {
    console.log('‼️ALL CONTENT DELETED‼️');
    await this.BlogModel.deleteMany();
    await this.PostModel.deleteMany();
    await this.CommentModel.deleteMany();
    await this.LikeModel.deleteMany();

    await this.dataSource.query('TRUNCATE users, session;');

    return;
  }
}
