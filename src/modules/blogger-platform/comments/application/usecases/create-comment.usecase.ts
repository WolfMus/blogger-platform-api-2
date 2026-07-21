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
import { PostsQwPostgresRepository } from '../../../posts/infrastructure/postgres/posts-query-postgres.repository';
import { CommentPostgres } from '../../domain/comment-postgres';
import { CommentsPostgresRepository } from '../../infrastructure/comments-postgres.repository';

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
    private commentRepo: CommentsPostgresRepository,
    private postQueryRepo: PostsQwPostgresRepository,
  ) {}
  async execute(command: CreateCommentCommand): Promise<CommentResponseDto> {
    // Пост существует?
    const post = await this.postQueryRepo.findById(command.postId);
    if (!post) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Post Not Found', 'id')],
      });
    }

    // DTO для создания комментария
    const createCommentDto: CreateCommentEntityDto = {
      content: command.dto.content,
      userId: command.userInfo.userId,
      userLogin: command.userInfo.login,
    };

    // Создание комментария
    const comment = CommentPostgres.createInstance(
      createCommentDto,
      command.postId,
    );

    // Сохранение
    const commentCreated = await this.commentRepo.create(comment);

    return this.commentMapper.toResponsePostgresView(commentCreated);
  }
}
