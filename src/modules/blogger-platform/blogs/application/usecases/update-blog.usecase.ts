import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBlogRequestDto } from '../../dto/create-blog.request.dto';
import {
  DomainException,
  Extension,
} from '../../../../../core/exceptions/domain-exception';
import { HttpStatus } from '@nestjs/common';
import { BlogsPostgresRepository } from '../../infrastructure/postgres/blogs-postgres.repository';

export class UpdateBlogCommand {
  constructor(
    public dto: CreateBlogRequestDto,
    public id: string,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(private blogsRepo: BlogsPostgresRepository) {}

  async execute(command: UpdateBlogCommand): Promise<void> {
    const blog = await this.blogsRepo.findById(command.id);
    if (!blog) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Blog Not Found', 'id')],
      });
    }
    blog.updateBlog(command.dto);
    await this.blogsRepo.save(blog);
    return;
  }
}
