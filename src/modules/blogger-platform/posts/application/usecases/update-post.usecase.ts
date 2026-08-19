import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostRequestDto } from '../../dto/create-post.request.dto';
import { HttpStatus } from '@nestjs/common';
import {
  DomainException,
  Extension,
} from '../../../../../core/exceptions/domain-exception';
import { PostRepository } from '../../infrastructure/post.repository';

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
  constructor(private postRepo: PostRepository) {}
  async execute(command: UpdatePostCommand): Promise<void> {
    const post = await this.postRepo.findById(command.id);
    if (!post) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Post Not Found', 'id')],
      });
    }
    post.updatePost(command.dto);
    const savedPost = await this.postRepo.save(post);
    if (!savedPost) {
      throw new Error('Post Was Not Saved');
    }
    return;
  }
}
