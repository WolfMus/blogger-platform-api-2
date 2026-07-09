import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BlogsPostgres } from '../../../domain/blog-postgres.entity';
import { BlogResponseDto } from '../../../dto/blog-response.dto';

@Injectable()
export class BlogsPostgresQwRepository {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
    @InjectRepository(BlogsPostgres)
    private blogsRepo: Repository<BlogsPostgres>,
  ) {}

  async findById(id: string): Promise<BlogResponseDto | null> {
    const blog = await this.blogsRepo.findOne({ where: { id } });
    if (!blog) return null;
    return BlogResponseDto.mapToViewPostgres(blog);
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
