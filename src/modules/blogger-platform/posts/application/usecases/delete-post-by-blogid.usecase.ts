import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  DomainException,
  Extension,
} from '../../../../../core/exceptions/domain-exception';
import { HttpStatus } from '@nestjs/common';
import { PostRepository } from '../../infrastructure/post.repository';
export class DeletePostByBlogIdCommand {
  constructor(
    public postId: string,
    public blogId: string,
  ) {}
}
@CommandHandler(DeletePostByBlogIdCommand)
export class DeletePostByBlogIdUseCase implements ICommandHandler<
  DeletePostByBlogIdCommand,
  void
> {
  constructor(private postsRepo: PostRepository) {}
  async execute(command: DeletePostByBlogIdCommand): Promise<void> {
    const deleted = await this.postsRepo.deleteByPostIdAndBlogId(
      command.postId,
      command.blogId,
    );
    if (deleted === null) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Post Not Found', 'id')],
      });
    }
    return;
  }
}
