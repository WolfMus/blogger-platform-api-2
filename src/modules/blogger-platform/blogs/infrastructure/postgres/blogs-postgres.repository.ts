import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BlogsPostgres } from '../../domain/blog-postgres.entity';
import { BlogResponseDto } from '../../dto/blog-response.dto';

@Injectable()
export class BlogsPostgresRepository {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
    @InjectRepository(BlogsPostgres)
    private blogsRepo: Repository<BlogsPostgres>,
  ) {}

  async findById(id: string): Promise<BlogsPostgres | null> {
    const blog = await this.blogsRepo.findOne({ where: { id } });
    if (!blog) return null;
    return blog;
  }

  async create(blog: BlogsPostgres): Promise<BlogResponseDto> {
    const row: BlogResponseDto = await this.dataSource.query(
      `
        INSERT INTO public.blogs(
          name,
          description,
          website_url,
          is_membership,
          created_at)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING 
            id, 
            name, 
            description, 
            website_url as "websiteUrl", 
            created_at as "createdAt", 
            is_membership as "isMembership";
      `,
      [
        blog.name,
        blog.description,
        blog.websiteUrl,
        blog.isMembership,
        blog.createdAt,
      ],
    );

    return row;
  }

  async save(blog: BlogsPostgres): Promise<void> {
    await this.blogsRepo.save(blog);
    return;
  }

  async deleteById(id: number): Promise<void | null> {
    const row = await this.dataSource.query<{ id: string }>(
      `
      DELETE 
      FROM public.blogs
	    WHERE id = $1
      RETURNING id;
      `,
      [id],
    );

    if (row[1] === 0) return null;
    else return;
  }
}
