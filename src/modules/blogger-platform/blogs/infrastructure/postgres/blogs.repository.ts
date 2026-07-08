import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { DomainException, Extension } from '../../../../../core/exceptions/domain-exception';
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

  // async findById(id: string): Promise<BlogDocument | null> {
  //   const blog = await this.BlogModel.findById(id);
  //   if (!blog) return null;
  //   return blog;
  // }

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

  // async delete(id: number): Promise<void> {
  //   const deletedBlog = await this.BlogModel.findByIdAndDelete(id);
  //   if (deletedBlog === null) {
  //     throw new DomainException({
  //       code: HttpStatus.NOT_FOUND,
  //       message: 'Not Found',
  //       extensions: [new Extension('Blog Not Found', 'id')],
  //     });
  //   }
  //   return;
  // }
}
