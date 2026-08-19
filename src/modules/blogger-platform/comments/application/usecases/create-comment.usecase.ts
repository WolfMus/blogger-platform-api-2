import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentResponseDto } from '../../dto/comment.response.dto';
import {
  DomainException,
  Extension,
} from '../../../../../core/exceptions/domain-exception';
import { HttpStatus } from '@nestjs/common';
import { CreateCommentEntityDto } from '../../dto/create-comment.entity.dto';
import { CommentMapper } from '../../dto/mapper/comment.response.mapper';
import { CreateCommentRequestDto } from '../../dto/create-comment.request.dto';
import { Comment } from '../../domain/comment.entity';
import { CommentRepository } from '../../infrastructure/comment.repository';
import { UserRepository } from '../../../../user-accounts/infrastructure/postgresql/user.sql.repository';
import { PostRepository } from '../../../posts/infrastructure/post.repository';

export class CreateCommentCommand {
  constructor(
    public postId: string,
    public userInfo: { userId: string; login: string },
    public dto: CreateCommentRequestDto,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase implements ICommandHandler<
  CreateCommentCommand,
  CommentResponseDto
> {
  constructor(
    private commentMapper: CommentMapper,
    private commentRepo: CommentRepository,
    private postRepo: PostRepository,
    private userRepo: UserRepository,
  ) {}
  async execute(command: CreateCommentCommand): Promise<CommentResponseDto> {
    // Пост существует?
    const post = await this.postRepo.findById(command.postId);
    if (!post) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Post Not Found', 'id')],
      });
    }

    // Пользователь существует?
    const user = await this.userRepo.findById(command.userInfo.userId);
    if (!user) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('User Not Found', 'id')],
      });
    }

    // DTO для создания комментария
    const createCommentDto: CreateCommentEntityDto = {
      content: command.dto.content,
      userId: command.userInfo.userId,
      userLogin: command.userInfo.login,
    };

    // Создание комментария
    const comment = Comment.createInstance(createCommentDto, user, post);

    // Сохранение
    const commentCreated = await this.commentRepo.save(comment);
    if (!commentCreated) {
      throw new Error('Comment Was Not Saved');
    }

    return this.commentMapper.toResponsePostgresView(commentCreated);
  }
}
