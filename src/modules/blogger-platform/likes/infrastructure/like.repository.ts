import { Injectable } from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { NewestLikes } from '../dto/newest-likes.dto';
import { Like } from '../domain/like.entity';
import { LikeStatus } from '../../../../core/types/like-status.enum';
import { LikeRow } from './types/like-row.type';

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

  async findLikeStatuses(
    entityIds: string[],
    userId: string,
  ): Promise<Like[] | null> {
    const a = await this.likeRepo.find({
      select: {
        entityId: true,
        entityType: true,
      },
      where: { entityId: In(entityIds), user: { id: userId } },
    });
    if (!a) {
      return null;
    }
    return a;
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
    // const rows = await this.dataSource.query<LikeRow[]>(
    //   `
    //     SELECT
    //       user_id as "userId",
    //       user_login as "userLogin",
    //       added_at as "addedAt"
    //     FROM likes
    //     WHERE entity_id = $1 AND like_status = 'Like'
    //     ORDER BY added_at DESC
    //     LIMIT 3;
    //   `,
    //   [entityId],
    // );
    // if (!rows.length) return [];
    // return rows;
  }

  async findNewestLikesByEntityIds(
    entityIds: string[],
  ): Promise<LikeRow[] | []> {
    const rows = await this.dataSource.query<LikeRow[]>(
      `
        SELECT
          entity_id as "entityId",
          added_at as "addedAt",
          user_id as "userId",
          user_login as "userLogin"
        FROM (
          SELECT
            *,
            ROW_NUMBER() OVER (
              PARTITION BY entity_id
              ORDER BY added_at DESC
            ) AS row_id
            FROM likes
            WHERE entity_id = ANY($1)
              AND like_status = 'Like'
        ) AS numbers
        WHERE row_id <= 3;
      `,
      [entityIds],
    );
    if (!rows.length) return [];
    return rows;
  }
}
