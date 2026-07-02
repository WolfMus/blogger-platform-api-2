import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Blog,
  BlogDocument,
  type BlogModelType,
} from '../../domain/blog.entity';
import { SortDirection } from '../../../../../core/dto/pagination.request.dto';
import { BlogPaginationRequest } from '../../dto/blog-pagination.request.dto';
import { BlogResponseDto } from '../../dto/blog-response.dto';

@Injectable()
export class BlogsQwRepository {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
  ) {}

  async findById(id: string): Promise<BlogResponseDto | null> {
    const blog = await this.BlogModel.findById(id);
    if (!blog) return null;
    return BlogResponseDto.mapToView(blog);
  }

  async findAll(
    paginationInput: BlogPaginationRequest,
  ): Promise<{ blogs: BlogDocument[]; totalCount: number }> {
    const sortBy = paginationInput.sortBy ?? 'createdAt';
    const sortDirection =
      paginationInput.sortDirection === SortDirection.Asc ? 1 : -1;
    const pageNumber = paginationInput.pageNumber ?? 1;
    const pageSize = paginationInput.pageSize ?? 10;
    const searchNameTerm = paginationInput.searchNameTerm ?? null;

    const filter: Record<string, any> = {};
    if (searchNameTerm) {
      filter.name = {
        $regex: searchNameTerm,
        $options: 'i',
      };
    }

    const skip = (pageNumber - 1) * pageSize;
    const blogs = await this.BlogModel.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize);

    const totalCount = await this.BlogModel.countDocuments(filter);

    return { blogs, totalCount };
  }
}
