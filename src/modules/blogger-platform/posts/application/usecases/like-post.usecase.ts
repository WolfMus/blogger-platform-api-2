import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  DomainException,
  Extension,
} from '../../../../../core/exceptions/domain-exception';
import { HttpStatus } from '@nestjs/common';
import { LikeRequestDto } from '../../../likes/dto/like.request.dto';
import { EntityType } from '../../../likes/types/entity-type.enum';
import { PostRepository } from '../../infrastructure/post.repository';
import { LikeRepository } from '../../../likes/infrastructure/like.repository';
import { LikeStatus } from '../../../../../core/types/like-status.enum';
import { Like } from '../../../likes/domain/like.entity';
import { UserRepository } from '../../../../user-accounts/infrastructure/postgresql/user.sql.repository';

export class LikePostCommand {
  constructor(
    public postId: string,
    public dto: LikeRequestDto,
    public userInfo: { userId: string; login: string },
  ) {}
}

@CommandHandler(LikePostCommand)
export class LikePostUseCase implements ICommandHandler<LikePostCommand, void> {
  constructor(
    private likeRepo: LikeRepository,
    private postRepo: PostRepository,
    private userRepo: UserRepository,
  ) {}
  async execute(command: LikePostCommand): Promise<void> {
    // Поиск поста
    const post = await this.postRepo.findById(command.postId);
    if (!post) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Post Not Found', 'id')],
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
      command.postId,
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

    if (command.dto.likeStatus === LikeStatus.None) {
      await this.likeRepo.delete(like!.id);
    } else if (!like) {
      const newLike = Like.createInstance(
        {
          entityId: command.postId,
          entityType: EntityType.Post,
          likeStatus: command.dto.likeStatus,
        },
        user,
      );
      await this.likeRepo.save(newLike);
    }
    // Меняем счетчик в БД
    await this.postRepo.changeCounts(deltaLike, deltaDislike, command.postId);
    return;
  }
}
