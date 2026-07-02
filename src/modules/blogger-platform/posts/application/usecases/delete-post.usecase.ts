import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import {
  DomainException,
  Extension,
} from '../../../../../core/exceptions/domain-exception';
import { HttpStatus } from '@nestjs/common';
export class DeletePostCommand {
  constructor(public id: string) {}
}
@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<
  DeletePostCommand,
  void
> {
  constructor(private postsRepo: PostsRepository) {}
  async execute(command: DeletePostCommand): Promise<void> {
    const post = await this.postsRepo.delete(command.id);
    if (!post) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Post Not Found', 'id')],
      });
    }
    return;
  }
}
