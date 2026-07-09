import { HttpStatus, Injectable } from '@nestjs/common';
import { BlogMapper } from '../dto/mapper/blog.response.mapper';
import { PaginatedBlogResponseDto } from '../dto/blog-paginated-view.response.dto';
import { BlogPaginationRequest } from '../dto/blog-pagination.request.dto';
import { BlogsQwRepository } from '../infrastructure/query/blogs-query.repository';
import { BlogResponseDto } from '../dto/blog-response.dto';
import {
  DomainException,
  Extension,
} from '../../../../core/exceptions/domain-exception';
import { BlogsPostgresQwRepository } from '../infrastructure/postgres/query/blogs-query-postgres.repository';

@Injectable()
export class BlogsService {
  constructor(
    private blogsQueryRepo: BlogsQwRepository,
    private blogsPostgresQueryRepo: BlogsPostgresQwRepository,
    private blogsMapper: BlogMapper,
  ) {}

  async findById(id: string): Promise<BlogResponseDto> {
    const blog = await this.blogsPostgresQueryRepo.findById(id);
    if (!blog) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Blog Not Found', 'id')],
      });
    }
    return blog;
  }

  async findAll(
    paginationInput: BlogPaginationRequest,
  ): Promise<PaginatedBlogResponseDto> {
    const { blogs, totalCount } =
      await this.blogsQueryRepo.findAll(paginationInput);
    return this.blogsMapper.toResponsePaginatedView(
      blogs,
      paginationInput,
      totalCount,
    );
  }
}
