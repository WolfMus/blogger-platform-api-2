import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { PostsPostgres } from '../../domain/post-postgres.entity';
import { DataSource, Repository } from 'typeorm';
import { PostResponseDto } from '../../dto/post.response.dto';

@Injectable()
export class PostsPostgresRepository {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
    @InjectRepository(PostsPostgres)
    private postsRepo: Repository<PostsPostgres>,
  ) {}

  async findById(id: string): Promise<PostResponseDto | null> {
    const post = await this.postsRepo.findOne({ where: { id } });
    if (!post) return null;
    return PostResponseDto.mapToViewPostgres(post);
  }

  async findByPostIdAndBlogId(
    postId: string,
    blogId: string,
  ): Promise<PostsPostgres | null> {
    const row = await this.dataSource.query<PostsPostgres[]>(
      `
      SELECT
      id,
      title,
      short_description as "shortDescription",
      content,
      blog_id as "blogId",
      likes_count as "likesCount",
      dislikes_count as "dislikesCount",
      created_at as "createdAt",
      updated_at as "updatedAt",
      blog_name as "blogName"
        FROM public.posts
        WHERE id = $1 AND blog_id = $2;
      `,
      [postId, blogId],
    );
    if (!row || row.length === 0) return null;
    return this.postsRepo.create(row[0]);
  }

  async save(post: PostsPostgres): Promise<void> {
    await this.postsRepo.save(post);
    return;
  }

  async deleteById(id: string): Promise<void | null> {
    const row = await this.dataSource.query<{ id: string }>(
      `
      DELETE 
      FROM public.posts
	    WHERE id = $1
      RETURNING id;
      `,
      [id],
    );

    if (row[1] === 0) return null;
    else return;
  }

  async deleteByPostIdAndBlogId(
    postId: string,
    blogId: string,
  ): Promise<boolean> {
    const row = await this.dataSource.query<{ id: string }>(
      `
      DELETE 
      FROM public.posts
	    WHERE id = $1 AND blog_id = $2
      RETURNING id;
      `,
      [postId, blogId],
    );
    if (row[1] == 1) {
      return true;
    }
    return false;
  }

  async changeCounts(
    deltaLike: number,
    deltaDislike: number,
    id: string,
  ): Promise<boolean> {
    const rows = await this.dataSource.query<{ id: string }[]>(
      `
      UPDATE posts
        SET likes_count = likes_count + $1,
            dislikes_count = dislikes_count + $2
        WHERE id = $3
        RETURNING id;
      `,
      [deltaLike, deltaDislike, id],
    );
    return rows.length > 0;
  }
}
