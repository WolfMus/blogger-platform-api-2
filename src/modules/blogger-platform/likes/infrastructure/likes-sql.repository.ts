import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Like, type LikeModelType } from '../domain/like.entity';
import { LikeStatus, NewestLikes } from '../../posts/domain/post.entity';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { LikePostgres } from '../domain/like-sql.entity';
import { LikeRow } from './types/like-row.type';
import { LikeMapper } from './types/like.mapper';

export interface PostLikesAgg {
  _id: string; // or Types.ObjectId if you prefer
  newestLikes: NewestLikes[];
}

@Injectable()
export class LikesSqlRepository {
  constructor(
    @InjectModel(Like.name)
    private LikeModel: LikeModelType,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async create(like: LikePostgres): Promise<boolean> {
    const rows = await this.dataSource.query<{ id: string }[]>(
      `
      INSERT INTO
        PUBLIC.LIKES (
          ENTITY_ID,
          ENTITY_TYPE,
          USER_LOGIN,
          ADDED_AT,
          USER_ID,
          LIKE_STATUS
        )
      VALUES
        ($1, $2, $3, $4, $5, $6)
      RETURNING id;
      `,
      [
        like.entityId,
        like.entityType,
        like.userLogin,
        like.addedAt,
        like.user.id,
        like.likeStatus,
      ],
    );
    return rows.length > 0;
  }

  async update(like: LikePostgres): Promise<boolean> {
    const rows = await this.dataSource.query<{ id: string }[]>(
      `
      UPDATE likes
	      SET added_at = $1, like_status = $2
	      WHERE id = $3
        RETURNING id;
      `,
      [like.addedAt, like.likeStatus, like.id],
    );
    return rows.length > 0;
  }

  async delete(id: string): Promise<boolean> {
    const rows = await this.dataSource.query<{ id: string }[]>(
      `
        DELETE FROM likes
	        WHERE id = $1
          RETURNING id;
      `,
      [id],
    );
    return rows.length > 0;
  }

  async findByEntityIdAndUserId(
    entityId: string,
    userId: string,
  ): Promise<LikePostgres | null> {
    const row = await this.dataSource.query<LikeRow[]>(
      `
        SELECT
          id, 
          entity_id as "entityId",
          entity_type as "entityType",
          user_id as "userId",
          user_login as "userLogin",
          added_at as "addedAt",
          like_status as "likeStatus"
        FROM likes
        WHERE entity_id = $1 AND user_id = $2;
      `,
      [entityId, userId],
    );
    if (!row.length) return null;
    return LikeMapper.toDomain(row[0]);
  }

  async findLikeStatus(
    entityId: string,
    userId: string,
  ): Promise<{ myStatus: string } | null> {
    const rows = await this.dataSource.query<{ myStatus: string }[]>(
      `
        SELECT
          like_status as "likeStatus"
        FROM likes
        WHERE entity_id = $1 AND user_id = $2;
      `,
      [entityId, userId],
    );
    if (!rows.length) return null;
    return rows[0];
  }

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
        WHERE entity_id = $1
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
