import { BlogResponseDto } from '../../dto/blog-response.dto';
import { CreateBlogRequestDto } from '../../dto/create-blog.request.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Blog } from '../../domain/blog.entity';
import { BlogRepository } from '../../infrastructure/blog.repository';

export class CreateBlogCommand {
  constructor(public dto: CreateBlogRequestDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(private blogRepo: BlogRepository) {}

  async execute(command: CreateBlogCommand): Promise<BlogResponseDto> {
    const blog = Blog.createInstance(command.dto);
    const savedBlog = await this.blogRepo.save(blog);
    if (!savedBlog) {
      throw new Error('Blog Was Not Saved');
    }
    return BlogResponseDto.mapToView(savedBlog);
  }
}
