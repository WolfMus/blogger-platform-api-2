import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostForBlogRequestDto } from '../../dto/create-post.request.dto';
import { HttpStatus } from '@nestjs/common';
import {
  DomainException,
  Extension,
} from '../../../../../core/exceptions/domain-exception';
import { PostsPostgresRepository } from '../../infrastructure/postgres/posts-postgres.repository';

export class UpdatePostByBlogIdCommand {
  constructor(
    public dto: CreatePostForBlogRequestDto,
    public postId: string,
    public blogId: string,
  ) {}
}

@CommandHandler(UpdatePostByBlogIdCommand)
export class UpdatePostByBlogIdUseCase implements ICommandHandler<
  UpdatePostByBlogIdCommand,
  void
> {
  constructor(private postsRepo: PostsPostgresRepository) {}

  async execute(command: UpdatePostByBlogIdCommand): Promise<void> {
    const post = await this.postsRepo.findByPostIdAndBlogId(
      command.postId,
      command.blogId,
    );
    if (!post) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Post Not Found', 'id')],
      });
    }
    post.updatePost(command.dto);
    await this.postsRepo.save(post);
    return;
  }
}
