import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsPostgresRepository } from '../../infrastructure/postgres/blogs-postgres.repository';
import { HttpStatus } from '@nestjs/common';
import {
  DomainException,
  Extension,
} from '../../../../../core/exceptions/domain-exception';

export class DeleteBlogCommand {
  constructor(public id: number) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(public blogsRepo: BlogsPostgresRepository) {}

  async execute(command: DeleteBlogCommand): Promise<void> {
    const deleted = await this.blogsRepo.deleteById(command.id);
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
