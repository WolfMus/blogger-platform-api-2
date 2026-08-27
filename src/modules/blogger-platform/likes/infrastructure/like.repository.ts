import { Injectable } from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { NewestLikes } from '../dto/newest-likes.dto';
import { Like } from '../domain/like.entity';
import { LikeStatus } from '../../../../core/types/like-status.enum';

export interface PostLikesAgg {
  _id: string; // or Types.ObjectId if you prefer
  newestLikes: NewestLikes[];
}

@Injectable()
export class LikeRepository {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
    @InjectRepository(Like)
    private likeRepo: Repository<Like>,
  ) {}

  async save(like: Like): Promise<Like | null> {
    const saved = await this.likeRepo.save(like);
    return saved;
  }

  async delete(id: string): Promise<void | null> {
    const deleted = await this.likeRepo.delete({ id: id });
    if (!deleted) {
      return null;
    }
    return;
  }

  async findByEntityIdAndUserId(
    entityId: string,
    userId: string,
  ): Promise<Like | null> {
    const like = await this.likeRepo.findOne({
      where: { entityId: entityId, user: { id: userId } },
    });
    if (!like) return null;
    return like;
  }

  async findLikeStatuses(entityIds: string[], userId: string): Promise<Like[]> {
    const likes = await this.likeRepo.find({
      where: { entityId: In(entityIds), user: { id: userId } },
      relations: { user: true },
    });
    return likes;
  }

  async findNewestLikesByEntityId(entityId: string): Promise<Like[]> {
    const likes = await this.likeRepo.find({
      where: { entityId: entityId, likeStatus: LikeStatus.Like },
      order: { addedAt: 'DESC' },
      take: 3,
      relations: { user: true },
    });
    if (!likes) return [];
    return likes;
  }

  async findNewestLikesByEntityIds(entityIds: string[]): Promise<Like[]> {
    if (!entityIds.length) return [];
    const promises = entityIds.map((id) => {
      return this.likeRepo.find({
        where: {
          entityId: id,
          likeStatus: LikeStatus.Like,
        },
        order: {
          addedAt: 'DESC',
        },
        take: 3,
        relations: { user: true },
      });
    });
    const results = await Promise.all(promises);
    return results.flat();
  }
}
