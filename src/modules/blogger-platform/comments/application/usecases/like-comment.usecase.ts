import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  DomainException,
  Extension,
} from '../../../../../core/exceptions/domain-exception';
import { HttpStatus } from '@nestjs/common';
import { LikeRequestDto } from '../../../likes/dto/like.request.dto';
import { EntityType } from '../../../likes/types/entity-type.enum';
import { LikeStatus } from '../../../../../core/types/like-status.enum';
import { Like } from '../../../likes/domain/like.entity';
import { LikeRepository } from '../../../likes/infrastructure/like.repository';
import { CommentRepository } from '../../infrastructure/comment.repository';
import { UserRepository } from '../../../../user-accounts/infrastructure/users/user.repository';

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
    private likeRepo: LikeRepository,
    private commentRepo: CommentRepository,
    private userRepo: UserRepository,
  ) {}
  async execute(command: LikeCommentCommand): Promise<void> {
    // Поиск комментария
    const comment = await this.commentRepo.findById(command.commentId);
    if (!comment) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Comment Not Found', 'id')],
      });
    }

    // Поиск пользователя
    const user = await this.userRepo.findById(command.userInfo.userId);
    if (!user) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('User Not Found', 'id')],
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
      const updated = await this.likeRepo.save(like);
      if (!updated) {
        throw new Error('Like Was Not Updated');
      }
    }

    // Новый статус
    if (command.dto.likeStatus === LikeStatus.Like) deltaLike += 1;
    if (command.dto.likeStatus === LikeStatus.Dislike) deltaDislike += 1;

    // Нет лайка
    if (command.dto.likeStatus === LikeStatus.None) {
      await this.likeRepo.delete(like!.id);
    } else if (!like) {
      const newLike = Like.createInstance(
        {
          entityId: command.commentId,
          entityType: EntityType.Comment,
          likeStatus: command.dto.likeStatus,
        },
        user,
      );
      const savedLike = await this.likeRepo.save(newLike);
      if (!savedLike) {
        throw new Error('Like Was Not Saved');
      }
      return;
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
