import { HttpStatus, Injectable } from '@nestjs/common';
import { BlogMapper } from '../dto/mapper/blog.response.mapper';
import { PaginatedBlogResponseDto } from '../dto/blog-paginated-view.response.dto';
import { BlogPaginationRequest } from '../dto/blog-pagination.request.dto';
import { BlogResponseDto } from '../dto/blog-response.dto';
import {
  DomainException,
  Extension,
} from '../../../../core/exceptions/domain-exception';
import { BlogQwRepository } from '../infrastructure/query/blog-query.repository';

@Injectable()
export class BlogService {
  constructor(
    private BlogQueryRepo: BlogQwRepository,
    private blogMapper: BlogMapper,
  ) {}

  async findById(id: string): Promise<BlogResponseDto> {
    const blog = await this.BlogQueryRepo.findById(id);
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
      await this.BlogQueryRepo.findAll(paginationInput);
    return this.blogMapper.toResponsePaginatedView(
      blogs,
      paginationInput,
      totalCount,
    );
  }
}
