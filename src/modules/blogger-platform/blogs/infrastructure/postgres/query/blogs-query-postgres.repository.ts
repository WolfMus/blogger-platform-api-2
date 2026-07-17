import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BlogsPostgres } from '../../../domain/blog-postgres.entity';
import { BlogResponseDto } from '../../../dto/blog-response.dto';
import { BlogPaginationRequest } from '../../../dto/blog-pagination.request.dto';
import { SortDirection } from '../../../../../../core/dto/pagination.request.dto';
import { CountResponseDto } from '../../../../../user-accounts/infrastructure/postgresql/dto/total-count.response.dto';

@Injectable()
export class BlogsPostgresQwRepository {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
    @InjectRepository(BlogsPostgres)
    private blogsRepo: Repository<BlogsPostgres>,
  ) {}

  private toEntity(blog: BlogsPostgres): BlogsPostgres {
    return this.blogsRepo.create(blog);
  }

  private toSnakeCase(key: string): string {
    return key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }

  async findById(id: string): Promise<BlogResponseDto | null> {
    const blog = await this.blogsRepo.findOne({ where: { id } });
    if (!blog) return null;
    return BlogResponseDto.mapToViewPostgres(blog);
  }

  async findAll(
    pagination: BlogPaginationRequest,
  ): Promise<{ blogs: BlogResponseDto[]; totalCount: number }> {
    const sortBy = pagination.sortBy ?? 'createdAt';
    const sortDirection =
      pagination.sortDirection === SortDirection.Asc
        ? SortDirection.Asc
        : SortDirection.Desc;
    const pageNumber = pagination.pageNumber ?? 1;
    const pageSize = pagination.pageSize ?? 10;
    const searchNameTerm = pagination.searchNameTerm ?? null;
    const offset = (pageNumber - 1) * pageSize;

    const conditions: string[] = [];
    const params: string[] = [];

    if (searchNameTerm) {
      params.push(`%${searchNameTerm}%`);
      conditions.push(`name ILIKE $${params.length}`);
    }

    const blogsQuery = `
        SELECT
        id,
        name,
        description,
        website_url as "websiteUrl",
        created_at as "createdAt",
        is_membership as "isMembership"
          FROM blogs
            ${conditions[0]}
            ORDER BY ${this.toSnakeCase(sortBy)} ${sortDirection.toUpperCase()}
            LIMIT $${params.length + 1}
            OFFSET $${params.length + 2};
      `;

    const blogsParams = [...params, pageSize, offset];
    const totalQuery = `
        SELECT COUNT(*) as total_count
        FROM blogs
        ${conditions[0]}
        `;
    const totalParams = [...params];

    const [blogs, totalCount] = await Promise.all([
      this.dataSource.query<BlogResponseDto[]>(blogsQuery, blogsParams),
      this.dataSource.query<CountResponseDto[]>(totalQuery, totalParams),
    ]);

    return {
      blogs: blogs,
      totalCount: Number(totalCount[0].total_count),
    };
  }

  // async findAll(
  //   paginationInput: BlogPaginationRequest,
  // ): Promise<{ blogs: BlogDocument[]; totalCount: number }> {
  //   const sortBy = paginationInput.sortBy ?? 'createdAt';
  //   const sortDirection =
  //     paginationInput.sortDirection === SortDirection.Asc ? 1 : -1;
  //   const pageNumber = paginationInput.pageNumber ?? 1;
  //   const pageSize = paginationInput.pageSize ?? 10;
  //   const searchNameTerm = paginationInput.searchNameTerm ?? null;

  //   const filter: Record<string, any> = {};
  //   if (searchNameTerm) {
  //     filter.name = {
  //       $regex: searchNameTerm,
  //       $options: 'i',
  //     };
  //   }

  //   const skip = (pageNumber - 1) * pageSize;
  //   const blogs = await this.BlogModel.find(filter)
  //     .sort({ [sortBy]: sortDirection })
  //     .skip(skip)
  //     .limit(pageSize);

  //   const totalCount = await this.BlogModel.countDocuments(filter);

  //   return { blogs, totalCount };
  // }
}
