import { PaginationInput } from '../../../../../core/dto/pagination.request.dto';
import { BlogDocument } from '../../domain/blog.entity';
import { BlogResponseDto } from '../blog-response.dto';
import { PaginatedBlogResponseDto } from '../blog-paginated-view.response.dto';

export class BlogMapper {
  toResponseView(blog: BlogDocument): BlogResponseDto {
    return {
      id: blog._id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    };
  }

  toResponsePaginatedView(
    blogs: BlogDocument[],
    paginationInput: PaginationInput,
    totalCount: number,
  ): PaginatedBlogResponseDto {
    const pageNumber = paginationInput.pageNumber ?? 1;
    const pageSize = paginationInput.pageSize ?? 10;
    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: totalCount,
      items: blogs.map((blog) => this.toResponseView(blog)),
    };
  }
}
