import { BlogResponseDto } from '../../dto/blog-response.dto';
import { CreateBlogRequestDto } from '../../dto/create-blog.request.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsPostgres } from '../../domain/blog-postgres.entity';
import { BlogsPostgresRepository } from '../../infrastructure/postgres/blogs-postgres.repository';

export class CreateBlogCommand {
  constructor(public dto: CreateBlogRequestDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(private blogsRepo: BlogsPostgresRepository) {}

  async execute(command: CreateBlogCommand): Promise<BlogResponseDto> {
    const blog = BlogsPostgres.createInstance(command.dto);
    const blogResponse = await this.blogsRepo.create(blog);
    return blogResponse;
  }
}
