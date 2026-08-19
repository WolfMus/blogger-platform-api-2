import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { BlogResponseDto } from '../../dto/blog-response.dto';
import { BlogPaginationRequest } from '../../dto/blog-pagination.request.dto';
import { SortDirection } from '../../../../../core/dto/pagination.request.dto';
import { Blog } from '../../domain/blog.entity';

@Injectable()
export class BlogQwRepository {
  constructor(
    @InjectRepository(Blog)
    private blogRepo: Repository<Blog>,
  ) {}

  async findById(id: string): Promise<BlogResponseDto | null> {
    const blog = await this.blogRepo.findOne({ where: { id: id } });
    if (!blog) return null;
    return BlogResponseDto.mapToView(blog);
  }

  async findAll(
    pagination: BlogPaginationRequest,
  ): Promise<{ blogs: Blog[]; totalCount: number }> {
    const sortBy = pagination.sortBy ?? 'createdAt';
    const sortDirection =
      pagination.sortDirection === SortDirection.Asc
        ? SortDirection.Asc
        : SortDirection.Desc;
    const pageNumber = pagination.pageNumber ?? 1;
    const pageSize = pagination.pageSize ?? 10;
    const offset = (pageNumber - 1) * pageSize;
    const where: FindOptionsWhere<Blog>[] = [];

    if (pagination.searchNameTerm) {
      where.push({
        name: ILike(`%${pagination.searchNameTerm}%`),
      });
    }

    const [blogs, totalCount] = await this.blogRepo.findAndCount({
      where: where.length > 0 ? where : undefined,
      order: { [sortBy]: sortDirection },
      skip: offset,
      take: pageSize,
    });

    return {
      blogs: blogs,
      totalCount: totalCount,
    };
  }
}
