import { Module } from '@nestjs/common';
import { BlogService } from './blogs/application/blog.service';
import { BlogController } from './blogs/api/blog.controller';
import { BlogMapper } from './blogs/dto/mapper/blog.response.mapper';
import { PostController } from './posts/api/post.controller';
import { PostService } from './posts/application/post.service';
import { PostMapper } from './posts/dto/mapper/post.response.mapper';
import { CommentController } from './comments/api/comment.controller';
import { CommentService } from './comments/application/comment.service';
import { CommentMapper } from './comments/dto/mapper/comment.response.mapper';
import { CreateBlogUseCase } from './blogs/application/usecases/create-blog.usecase';
import { UpdateBlogUseCase } from './blogs/application/usecases/update-blog.usecase';
import { DeleteBlogUseCase } from './blogs/application/usecases/delete-blog.usecase';
import { CreatePostUseCase } from './posts/application/usecases/create-post.usecase';
import { UpdatePostUseCase } from './posts/application/usecases/update-post.usecase';
import { DeletePostUseCase } from './posts/application/usecases/delete-post.usecase';
import { CreateCommentUseCase } from './comments/application/usecases/create-comment.usecase';
import { UpdateCommentUseCase } from './comments/application/usecases/update-comment.usecase';
import { LikeCommentUseCase } from './comments/application/usecases/like-comment.usecase';
import { LikeRepository } from './likes/infrastructure/like.repository';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { LikePostUseCase } from './posts/application/usecases/like-post.usecase';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogRepository } from './blogs/infrastructure/blog.repository';
import { BlogQwRepository } from './blogs/infrastructure/query/blog-query.repository';
import { SuperAdminBlogController } from './blogs/api/blog-sa.controller';
import { UpdatePostByBlogIdUseCase } from './posts/application/usecases/update-post-by-blogid.usecase';
import { DeletePostByBlogIdUseCase } from './posts/application/usecases/delete-post-by-blogid.usecase';
import { Post } from './posts/domain/post.entity';
import { Comment } from './comments/domain/comment.entity';
import { PostRepository } from './posts/infrastructure/post.repository';
import { PostQwRepository } from './posts/infrastructure/post-query.repository';
import { Blog } from './blogs/domain/blog.entity';
import { CommentRepository } from './comments/infrastructure/comment.repository';
import { Like } from './likes/domain/like.entity';

const blogUseCases = [CreateBlogUseCase, UpdateBlogUseCase, DeleteBlogUseCase];
const postUseCases = [
  CreatePostUseCase,
  UpdatePostUseCase,
  UpdatePostByBlogIdUseCase,
  DeletePostUseCase,
  DeletePostByBlogIdUseCase,
  LikePostUseCase,
];
const commentUseCases = [
  CreateCommentUseCase,
  UpdateCommentUseCase,
  LikeCommentUseCase,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([Blog, Post, Comment, Like]),
    UserAccountsModule,
  ],
  controllers: [
    BlogController,
    SuperAdminBlogController,
    PostController,
    CommentController,
  ],
  providers: [
    ...blogUseCases,
    ...postUseCases,
    ...commentUseCases,
    BlogService,
    BlogRepository,
    BlogQwRepository,
    BlogMapper,
    PostService,
    PostRepository,
    PostQwRepository,
    PostMapper,
    CommentService,
    CommentRepository,
    CommentMapper,
    LikeRepository,
  ],
})
export class BloggerPlatformModule {}
