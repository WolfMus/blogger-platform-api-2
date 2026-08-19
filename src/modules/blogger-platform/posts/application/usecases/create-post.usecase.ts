import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostRequestDto } from '../../dto/create-post.request.dto';
import { PostResponseDto } from '../../dto/post.response.dto';
import { Post } from '../../domain/post.entity';
import { PostRepository } from '../../infrastructure/post.repository';
import { BlogRepository } from '../../../blogs/infrastructure/blog.repository';
import {
  DomainException,
  Extension,
} from '../../../../../core/exceptions/domain-exception';
import { HttpStatus } from '@nestjs/common';

export class CreatePostCommand {
  constructor(public dto: CreatePostRequestDto) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    private postRepo: PostRepository,
    private blogRepo: BlogRepository,
  ) {}

  async execute(command: CreatePostCommand): Promise<PostResponseDto> {
    const blog = await this.blogRepo.findById(command.dto.blogId);
    if (!blog) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Blog Not Found', 'id')],
      });
    }
    const post = Post.createInstance(command.dto, blog);
    await this.postRepo.save(post);
    return PostResponseDto.mapToView(post);
  }
}
