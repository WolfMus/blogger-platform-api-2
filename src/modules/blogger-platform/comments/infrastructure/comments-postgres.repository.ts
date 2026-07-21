import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from '../domain/comment.entity';
import type { CommentModelType } from '../domain/comment.entity';
import {
  PaginationInput,
  SortDirection,
} from '../../../../core/dto/pagination.request.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentPostgres } from '../domain/comment-postgres';
import { DataSource } from 'typeorm/browser';
import { CountResponseDto } from '../../../user-accounts/infrastructure/postgresql/dto/total-count.response.dto';

@Injectable()
export class CommentsPostgresRepository {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    @InjectDataSource()
    private dataSource: DataSource,
    @InjectRepository(CommentPostgres)
    private commentsRepo: Repository<CommentPostgres>,
  ) {}

  private toSnakeCase(key: string): string {
    return key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }

  async findById(id: string): Promise<CommentPostgres | null> {
    const comment = await this.commentsRepo.findOne({ where: { id } });
    if (!comment) return null;
    return comment;
  }

  async findAll(
    paginationInput: PaginationInput,
  ): Promise<{ comments: CommentDocument[]; totalCount: number }> {
    const sortBy = paginationInput.sortBy ?? 'createdAt';
    const sortDirection =
      paginationInput.sortDirection === SortDirection.Asc ? 1 : -1;
    const pageNumber = paginationInput.pageNumber ?? 1;
    const pageSize = paginationInput.pageSize ?? 10;
    const skip = (pageNumber - 1) * pageSize;

    const comments = await this.CommentModel.find()
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize);

    const totalCount = await this.CommentModel.countDocuments();

    return { comments, totalCount };
  }

  async findAllByPostId(
    pagination: PaginationInput,
    postId: string,
  ): Promise<{ comments: CommentPostgres[]; totalCount: number }> {
    const sortBy = pagination.sortBy ?? 'createdAt';
    const sortDirection =
      pagination.sortDirection === SortDirection.Asc
        ? SortDirection.Asc
        : SortDirection.Desc;
    const pageNumber = pagination.pageNumber ?? 1;
    const pageSize = pagination.pageSize ?? 10;
    const offset = (pageNumber - 1) * pageSize;

    const commentsQuery = `
        SELECT
          id, 
          content, 
          user_id as "userId", 
          user_login as "userLogin", 
          created_at as "createdAt", 
          likes_count as "likesCount",
          dislikes_count as "dislikesCount"
        FROM comments
          WHERE post_id = $1
          ORDER BY ${this.toSnakeCase(sortBy)} ${sortDirection.toUpperCase()}
          LIMIT $2
          OFFSET $3;
      `;
    const commentsParams = [postId, pageSize, offset];

    const totalQuery = `
        SELECT COUNT(*) as total_count
        FROM comments
        WHERE post_id = $1
        `;
    const totalParams = [postId];

    const [comments, totalCount] = await Promise.all([
      this.dataSource.query<CommentPostgres[]>(commentsQuery, commentsParams),
      this.dataSource.query<CountResponseDto[]>(totalQuery, totalParams),
    ]);

    return {
      comments: comments,
      totalCount: Number(totalCount[0].total_count),
    };
  }

  async create(comment: CommentPostgres): Promise<CommentPostgres> {
    const row: CommentPostgres[] = await this.dataSource.query(
      `
        INSERT INTO comments(
	        content,
	        user_id,
	        user_login,
	        post_id,
	        created_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING 
          id, 
          content, 
          user_id as "userId", 
          user_login as "userLogin", 
          created_at as "createdAt", 
          likes_count as "likesCount",
          dislikes_count as "dislikesCount"
      `,
      [
        comment.content,
        comment.userId,
        comment.userLogin,
        comment.postId,
        comment.createdAt,
      ],
    );

    console.log(row);
    return row[0];
  }

  async save(comment: CommentPostgres): Promise<void> {
    await this.commentsRepo.save(comment);
    return;
  }

  async delete(id: string): Promise<string | null> {
    const [rows, count] = await this.dataSource.query<
      [{ id: string }[], number]
    >(
      `
      DELETE 
      FROM comments
	    WHERE id = $1
      RETURNING id;
      `,
      [id],
    );

    if (count === 0 || !rows.length) {
      return null;
    }

    return rows[0].id;
  }

  async changeCounts(
    deltaLike: number,
    deltaDislike: number,
    id: string,
  ): Promise<void> {
    await this.CommentModel.findOneAndUpdate(
      { _id: id },
      {
        $inc: {
          'likesInfo.likesCount': deltaLike,
          'likesInfo.dislikesCount': deltaDislike,
        },
      },
    );
    return;
  }
}
