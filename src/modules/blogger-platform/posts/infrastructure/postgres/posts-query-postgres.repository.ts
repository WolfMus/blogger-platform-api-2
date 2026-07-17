import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PostsPostgres } from '../../domain/post-postgres.entity';
import { PostResponseDto } from '../../dto/post.response.dto';
import {
  PaginationInput,
  SortDirection,
} from '../../../../../core/dto/pagination.request.dto';
import { CountResponseDto } from '../../../../user-accounts/infrastructure/postgresql/dto/total-count.response.dto';
import { PostViewDto } from '../../dto/post.view-model.dto';

@Injectable()
export class PostsQwPostgresRepository {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
    @InjectRepository(PostsPostgres)
    private postsRepo: Repository<PostsPostgres>,
  ) {}

  private toSnakeCase(key: string): string {
    return key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }

  async findById(id: string): Promise<PostResponseDto | null> {
    const post = await this.postsRepo.findOne({ where: { id } });
    if (!post) return null;
    return PostResponseDto.mapToViewPostgres(post);
  }

  async findAll(
    pagination: PaginationInput,
  ): Promise<{ posts: PostViewDto[]; totalCount: number }> {
    const sortBy = pagination.sortBy ?? 'createdAt';
    const sortDirection =
      pagination.sortDirection === SortDirection.Asc
        ? SortDirection.Asc
        : SortDirection.Desc;
    const pageNumber = pagination.pageNumber ?? 1;
    const pageSize = pagination.pageSize ?? 10;
    const offset = (pageNumber - 1) * pageSize;

    const postsQuery = `
        SELECT
        id,
        title,
        short_description as "shortDescription",
        content,
        blog_id as "blogId",
        blog_name as "blogName",
        created_at as "createdAt",
        likes_count as "likesCount",
        dislikes_count as "dislikesCount"
          FROM posts
            ORDER BY ${this.toSnakeCase(sortBy)} ${sortDirection.toUpperCase()}
            LIMIT $1
            OFFSET $2;
      `;
    const postsParams = [pageSize, offset];

    const totalQuery = `
        SELECT COUNT(*) as total_count
        FROM posts
        WHERE blog_id = $1
        `;

    const [posts, totalCount] = await Promise.all([
      this.dataSource.query<PostViewDto[]>(postsQuery, postsParams),
      this.dataSource.query<CountResponseDto[]>(totalQuery),
    ]);

    return {
      posts: posts,
      totalCount: Number(totalCount[0].total_count),
    };
  }

  async findAllByBlogId(
    pagination: PaginationInput,
    blogId: string,
  ): Promise<{ posts: PostViewDto[]; totalCount: number }> {
    const sortBy = pagination.sortBy ?? 'createdAt';
    const sortDirection =
      pagination.sortDirection === SortDirection.Asc
        ? SortDirection.Asc
        : SortDirection.Desc;
    const pageNumber = pagination.pageNumber ?? 1;
    const pageSize = pagination.pageSize ?? 10;
    const offset = (pageNumber - 1) * pageSize;

    const postsQuery = `
        SELECT
        id,
        title,
        short_description as "shortDescription",
        content,
        blog_id as "blogId",
        blog_name as "blogName",
        created_at as "createdAt",
        likes_count as "likesCount",
        dislikes_count as "dislikesCount"
          FROM posts
            WHERE blog_id = $1
            ORDER BY ${this.toSnakeCase(sortBy)} ${sortDirection.toUpperCase()}
            LIMIT $2
            OFFSET $3;
      `;
    const postsParams = [blogId, pageSize, offset];

    const totalQuery = `
        SELECT COUNT(*) as total_count
        FROM posts
        WHERE blog_id = $1
        `;
    const totalParams = [blogId];

    const [posts, totalCount] = await Promise.all([
      this.dataSource.query<PostViewDto[]>(postsQuery, postsParams),
      this.dataSource.query<CountResponseDto[]>(totalQuery, totalParams),
    ]);

    return {
      posts: posts,
      totalCount: Number(totalCount[0].total_count),
    };
  }
}
