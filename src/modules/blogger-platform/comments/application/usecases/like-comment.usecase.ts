import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import {
  DomainException,
  Extension,
} from '../../../../../core/exceptions/domain-exception';
import { HttpStatus } from '@nestjs/common';
import { Like, type LikeModelType } from '../../../likes/domain/like.entity';
import { InjectModel } from '@nestjs/mongoose';
import { LikesRepository } from '../../../likes/infrastructure/likes.repository';
import { LikeRequestDto } from '../../../likes/dto/like.request.dto';
import { EntityType } from '../../../likes/types/entity-type.enum';
import { LikeStatus } from '../../../../../core/types/like-status.enum';

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
    @InjectModel(Like.name)
    private LikeModel: LikeModelType,
    private likeRepo: LikesRepository,
    private commentRepo: CommentsRepository,
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
      await this.likeRepo.save(like);
    }

    // Новый статус
    if (command.dto.likeStatus === LikeStatus.Like) deltaLike += 1;
    if (command.dto.likeStatus === LikeStatus.Dislike) deltaDislike += 1;

    /*
     * если лайк был и приходит None => удаляем лайк
     * иначе если лайка не было, то создаем сущность и сохраняем в бд
     */
    if (command.dto.likeStatus === LikeStatus.None) {
      await this.likeRepo.delete(like!._id.toString());
    } else if (!like) {
      const newLike = this.LikeModel.createInstance({
        entityId: command.commentId,
        entityType: EntityType.Comment,
        userId: command.userInfo.userId,
        userLogin: command.userInfo.login,
        likeStatus: command.dto.likeStatus,
      });
      await this.likeRepo.save(newLike);
    }
    // Меняем счетчик в БД
    await this.commentRepo.changeCounts(
      deltaLike,
      deltaDislike,
      command.commentId,
    );
    return;
  }
}
