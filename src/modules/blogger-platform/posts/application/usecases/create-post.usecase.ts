import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Post, type PostModelType } from '../../domain/post.entity';
import { CreatePostRequestDto } from '../../dto/create-post.request.dto';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { PostResponseDto } from '../../dto/post.response.dto';
import { BlogsService } from '../../../blogs/application/blogs.service';

export class CreatePostCommand {
  constructor(public dto: CreatePostRequestDto) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    private postRepo: PostsRepository,
    private blogService: BlogsService,
  ) {}

  async execute(command: CreatePostCommand): Promise<PostResponseDto> {
    const blog = await this.blogService.findById(command.dto.blogId);
    const post = this.PostModel.createInstance(command.dto, blog.name);
    await this.postRepo.save(post);
    return PostResponseDto.mapToView(post);
  }
}
