import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogRepository } from '../../infrastructure/blog.repository';
import { HttpStatus } from '@nestjs/common';
import {
  DomainException,
  Extension,
} from '../../../../../core/exceptions/domain-exception';

export class DeleteBlogCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(public blogRepo: BlogRepository) {}

  async execute(command: DeleteBlogCommand): Promise<void> {
    const deleted = await this.blogRepo.delete(command.id);
    if (deleted === null) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('User Not Found', 'id')],
      });
    }
    return;
  }
}
