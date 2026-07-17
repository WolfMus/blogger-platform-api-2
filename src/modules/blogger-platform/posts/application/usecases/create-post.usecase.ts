import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostRequestDto } from '../../dto/create-post.request.dto';
import { PostResponseDto } from '../../dto/post.response.dto';
import { BlogsService } from '../../../blogs/application/blogs.service';
import { PostsPostgres } from '../../domain/post-postgres.entity';
import { PostsPostgresRepository } from '../../infrastructure/postgres/posts-postgres.repository';

export class CreatePostCommand {
  constructor(public dto: CreatePostRequestDto) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    private postRepo: PostsPostgresRepository,
    private blogService: BlogsService,
  ) {}

  async execute(command: CreatePostCommand): Promise<PostResponseDto> {
    const blog = await this.blogService.findById(command.dto.blogId);
    const post = PostsPostgres.createInstance(command.dto, blog.name);
    await this.postRepo.save(post);
    return PostResponseDto.mapToViewPostgres(post);
  }
}
