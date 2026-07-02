import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Like, LikeDocument, type LikeModelType } from '../domain/like.entity';
import { LikeStatus, NewestLikes } from '../../posts/domain/post.entity';

export interface PostLikesAgg {
  _id: string; // or Types.ObjectId if you prefer
  newestLikes: NewestLikes[];
}

@Injectable()
export class LikesRepository {
  constructor(
    @InjectModel(Like.name)
    private LikeModel: LikeModelType,
  ) {}

  async save(like: LikeDocument): Promise<void> {
    await like.save();
    return;
  }

  async delete(id: string): Promise<void> {
    await this.LikeModel.findByIdAndDelete(id);
    return;
  }

  async findByEntityIdAndUserId(
    entityId: string | string[],
    userId: string,
  ): Promise<LikeDocument | null> {
    const like = await this.LikeModel.findOne({
      entityId: entityId,
      userId: userId,
    });
    if (!like) return null;
    return like;
  }

  async findEntityIdAndLikeStatus(
    entityId: string[],
    userId: string,
  ): Promise<[string, LikeStatus][] | null> {
    const likes = await this.LikeModel.find({
      entityId: entityId,
      userId: userId,
    });
    if (!likes) return null;
    return likes.map((like) => [like.entityId, like.likeStatus]);
  }

  async findNewestLikesByEntityId(
    entityId: string,
  ): Promise<LikeDocument[] | null> {
    const likes = await this.LikeModel.find({
      entityId: entityId,
      likeStatus: LikeStatus.Like,
    })
      .sort({ addedAt: -1 })
      .limit(3);
    if (!likes) return null;
    return likes;
  }

  async findNewestLikesForPosts(
    postIds: string[],
  ): Promise<PostLikesAgg[] | []> {
    const likes = await this.LikeModel.aggregate<PostLikesAgg>([
      // Шаг 1: Фильтруем только лайки для нужных нам постов
      {
        $match: {
          entityId: { $in: postIds },
          likeStatus: LikeStatus.Like,
        },
      },
      // Шаг 2: Сортируем все лайки от самых новых к старым
      {
        $sort: {
          addedAt: -1,
        },
      },
      // Шаг 3: Группируем лайки по каждому посту
      {
        $group: {
          _id: '$entityId',
          // $push сохраняет порядок сортировки, полученный на Шаге 2
          allLikes: {
            $push: {
              addedAt: '$addedAt',
              userId: '$userId',
              login: '$userLogin',
            },
          },
        },
      },
      // Шаг 4: Обрезаем массив, оставляя строго первые 3 лайка
      {
        $project: {
          _id: 1,
          newestLikes: { $slice: ['$allLikes', 3] },
        },
      },
    ]);
    if (!likes) return [];
    return likes;
  }
}
