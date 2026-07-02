import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostRequestDto } from '../../dto/create-post.request.dto';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { HttpStatus } from '@nestjs/common';
import {
  DomainException,
  Extension,
} from '../../../../../core/exceptions/domain-exception';

export class UpdatePostCommand {
  constructor(
    public dto: CreatePostRequestDto,
    public id: string,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<
  UpdatePostCommand,
  void
> {
  constructor(private postsRepo: PostsRepository) {}
  async execute(command: UpdatePostCommand): Promise<void> {
    const post = await this.postsRepo.findById(command.id);
    if (!post) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Post Not Found', 'id')],
      });
    }
    post.updatePost(command.dto);
    return await this.postsRepo.save(post);
  }
}
