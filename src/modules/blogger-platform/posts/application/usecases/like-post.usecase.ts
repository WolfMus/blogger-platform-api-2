import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeStatus } from '../../../posts/domain/post.entity';
import {
  DomainException,
  Extension,
} from '../../../../../core/exceptions/domain-exception';
import { HttpStatus } from '@nestjs/common';
import { Like, type LikeModelType } from '../../../likes/domain/like.entity';
import { InjectModel } from '@nestjs/mongoose';
import { LikesRepository } from '../../../likes/infrastructure/likes.repository';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { LikeRequestDto } from '../../../likes/dto/like.request.dto';
import { EntityType } from '../../../likes/types/entity-type.enum';

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
    @InjectModel(Like.name)
    private LikeModel: LikeModelType,
    private likeRepo: LikesRepository,
    private postRepo: PostsRepository,
  ) {}
  async execute(command: LikePostCommand): Promise<void> {
    // Поиск поста
    const post = await this.postRepo.findById(command.postId);
    if (!post) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('id', 'Post Not Found')],
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
      await this.likeRepo.save(like);
    }

    // Новый статус
    if (command.dto.likeStatus === LikeStatus.Like) deltaLike += 1;
    if (command.dto.likeStatus === LikeStatus.Dislike) deltaDislike += 1;

    if (command.dto.likeStatus === LikeStatus.None) {
      await this.likeRepo.delete(like!._id.toString());
    } else if (!like) {
      const newLike = this.LikeModel.createInstance({
        entityId: command.postId,
        entityType: EntityType.Post,
        userId: command.userInfo.userId,
        userLogin: command.userInfo.login,
        likeStatus: command.dto.likeStatus,
      });
      await this.likeRepo.save(newLike);
    }
    // Меняем счетчик в БД
    await this.postRepo.changeCounts(deltaLike, deltaDislike, command.postId);
    return;
  }
}
