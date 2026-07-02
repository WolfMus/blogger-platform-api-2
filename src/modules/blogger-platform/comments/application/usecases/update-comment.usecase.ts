import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import {
  DomainException,
  Extension,
} from '../../../../../core/exceptions/domain-exception';
import { HttpStatus } from '@nestjs/common';
import { CreateCommentRequestDto } from '../../dto/create-comment.request.dto';

export class UpdateCommentCommand {
  constructor(
    public id: string,
    public dto: CreateCommentRequestDto,
    public userInfo: { userId: string; login: string },
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase implements ICommandHandler<
  UpdateCommentCommand,
  void
> {
  constructor(private commentRepo: CommentsRepository) {}
  async execute(command: UpdateCommentCommand): Promise<void> {
    // Существует ли комментарий
    const comment = await this.commentRepo.findById(command.id);
    if (!comment) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Comment', 'Comment Not Found')],
      });
    }
    // Твои ли комментарий
    if (comment.commentatorInfo.userId !== command.userInfo.userId) {
      throw new DomainException({
        code: HttpStatus.FORBIDDEN,
        message: 'Forbidden',
        extensions: [new Extension('userId', 'Not Your Comment')],
      });
    }
    // Изменение комментария
    comment.changeContent(command.dto.content);
    return await this.commentRepo.save(comment);
  }
}
