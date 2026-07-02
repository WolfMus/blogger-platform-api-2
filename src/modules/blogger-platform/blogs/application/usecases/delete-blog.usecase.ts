import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

export class DeleteBlogCommand {
  constructor(public id: number) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(public blogsRepo: BlogsRepository) {}

  async execute(command: DeleteBlogCommand): Promise<void> {
    return await this.blogsRepo.delete(command.id);
  }
}
