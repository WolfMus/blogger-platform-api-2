import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  DomainException,
  Extension,
} from '../../../../../core/exceptions/domain-exception';
import { HttpStatus } from '@nestjs/common';
import { LikeRequestDto } from '../../../likes/dto/like.request.dto';
import { EntityType } from '../../../likes/types/entity-type.enum';
import { LikeStatus } from '../../../../../core/types/like-status.enum';
import { LikesSqlRepository } from '../../../likes/infrastructure/likes-sql.repository';
import { LikePostgres } from '../../../likes/domain/like-sql.entity';
import { CommentsPostgresRepository } from '../../infrastructure/comments-sql.repository';

export class LikeCommentCommand {
  constructor(
    public commentId: string,
    public dto: LikeRequestDto,
    public userInfo: { userId: string; login: string },
  ) {}
}

@CommandHandler(LikeCommentCommand)
export class LikeCommentUseCase implements ICommandHandler<
  LikeCommentCommand,
  void
> {
  constructor(
    private likeRepo: LikesSqlRepository,
    private commentRepo: CommentsPostgresRepository,
  ) {}
  async execute(command: LikeCommentCommand): Promise<void> {
    // Поиск комментария
    const comment = await this.commentRepo.findById(command.commentId);
    if (!comment) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('id', 'Comment Not Found')],
      });
    }

    // Поиск лайка
    const like = await this.likeRepo.findByEntityIdAndUserId(
      command.commentId,
      command.userInfo.userId,
    );
    if (
      (like && command.dto.likeStatus === like.likeStatus) ||
      (!like && command.dto.likeStatus === LikeStatus.None)
    ) {
      return;
    }

    let deltaLike = 0;
    let deltaDislike = 0;

    // Предыдущий статус
    if (like) {
      if (like.likeStatus === LikeStatus.Like) deltaLike = -1;
      if (like.likeStatus === LikeStatus.Dislike) deltaDislike = -1;
      like.changeStatus(command.dto.likeStatus);
      const updated = await this.likeRepo.update(like);
      if (!updated) {
        throw new Error('Not Updated');
      }
    }

    // Новый статус
    if (command.dto.likeStatus === LikeStatus.Like) deltaLike += 1;
    if (command.dto.likeStatus === LikeStatus.Dislike) deltaDislike += 1;

    // Нет лайка
    if (command.dto.likeStatus === LikeStatus.None) {
      await this.likeRepo.delete(like!.id);
    } else if (!like) {
      const newLike = LikePostgres.createInstance({
        entityId: command.commentId,
        entityType: EntityType.Comment,
        userId: command.userInfo.userId,
        userLogin: command.userInfo.login,
        likeStatus: command.dto.likeStatus,
      });
      await this.likeRepo.create(newLike);
    }
    // Меняем счетчик в БД
    const updatedCounts = await this.commentRepo.changeCounts(
      deltaLike,
      deltaDislike,
      command.commentId,
    );
    if (!updatedCounts) {
      throw new Error('Comment Counts Not Updated');
    }
    return;
  }
}
