import { InjectModel } from '@nestjs/mongoose';
import { Blog, type BlogModelType } from '../../domain/blog.entity';
import { BlogResponseDto } from '../../dto/blog-response.dto';
import { CreateBlogRequestDto } from '../../dto/create-blog.request.dto';
import { BlogMapper } from '../../dto/mapper/blog.response.mapper';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class CreateBlogCommand {
  constructor(public dto: CreateBlogRequestDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    private blogsRepo: BlogsRepository,
    private blogsMapper: BlogMapper,
  ) {}

  async execute(command: CreateBlogCommand): Promise<BlogResponseDto> {
    const blog = this.BlogModel.createInstance(command.dto);
    await this.blogsRepo.save(blog);
    return this.blogsMapper.toResponseView(blog);
  }
}
