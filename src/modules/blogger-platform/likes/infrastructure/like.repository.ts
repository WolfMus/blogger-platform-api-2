import { Injectable } from '@nestjs/common';
import { LikeStatus } from '../../posts/domain/post.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { LikeRow } from './types/like-row.type';
import { NewestLikes } from '../dto/newest-likes.dto';
import { Like } from '../domain/like.entity';

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
  // Можно заменить обычным поиском
  // async findLikeStatus(
  //   entityId: string,
  //   userId: string,
  // ): Promise<{ myStatus: string } | null> {
  //   const rows = await this.dataSource.query<{ myStatus: string }[]>(
  //     `
  //       SELECT
  //         like_status as "likeStatus"
  //       FROM likes
  //       WHERE entity_id = $1 AND user_id = $2;
  //     `,
  //     [entityId, userId],
  //   );
  //   if (!rows.length) return null;
  //   return rows[0];
  // }

  async findLikeStatuses(
    entityIds: string[],
    userId: string,
  ): Promise<[string, LikeStatus][] | null> {
    const rows = await this.dataSource.query<
      {
        entityId: string;
        likeStatus: string;
      }[]
    >(
      `
        SELECT
          entity_id AS "entityId",
          like_status AS "likeStatus"
        FROM likes
        WHERE entity_id = ANY($1) AND user_id = $2;
      `,
      [entityIds, userId],
    );
    if (!rows.length) return null;
    return rows.map((like) => [like.entityId, like.likeStatus as LikeStatus]);
  }

  async findNewestLikesByEntityId(entityId: string): Promise<LikeRow[]> {
    const rows = await this.dataSource.query<LikeRow[]>(
      `
        SELECT
          user_id as "userId",
          user_login as "userLogin",
          added_at as "addedAt"
        FROM likes
        WHERE entity_id = $1 AND like_status = 'Like'
        ORDER BY added_at DESC
        LIMIT 3;
      `,
      [entityId],
    );
    if (!rows.length) return [];
    return rows;
  }

  async findNewestLikesByEntityIds(entityIds: string[]): Promise<LikeRow[]> {
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
    console.log(rows);
    return rows;
  }
}
