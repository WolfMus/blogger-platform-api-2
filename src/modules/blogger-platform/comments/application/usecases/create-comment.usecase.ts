import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentResponseDto } from '../../dto/comment.response.dto';
import { PostsQwRepository } from '../../../posts/infrastructure/posts-query.repository';
import {
  DomainException,
  Extension,
} from '../../../../../core/exceptions/domain-exception';
import { HttpStatus } from '@nestjs/common';
import { CreateCommentEntityDto } from '../../dto/create-comment.entity.dto';
import { Comment, type CommentModelType } from '../../domain/comment.entity';
import { InjectModel } from '@nestjs/mongoose';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { CommentMapper } from '../../dto/mapper/comment.response.mapper';
import { CreateCommentRequestDto } from '../../dto/create-comment.request.dto';

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
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    private commentRepo: CommentsRepository,
    private postQueryRepo: PostsQwRepository,
    private commentMapper: CommentMapper,
  ) {}
  async execute(command: CreateCommentCommand): Promise<CommentResponseDto> {
    // Пост существует?
    const post = await this.postQueryRepo.findById(command.postId);
    if (!post) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Comment', 'Comment Not Found')],
      });
    }

    // DTO для создания комментария
    const createCommentDto: CreateCommentEntityDto = {
      content: command.dto.content,
      userId: command.userInfo.userId,
      userLogin: command.userInfo.login,
    };

    // Создание комментария
    const comment = this.CommentModel.createInstance(
      createCommentDto,
      command.postId,
    );

    // Сохранение
    await this.commentRepo.save(comment);

    return this.commentMapper.toResponseView(comment);
  }
}
