import { Injectable } from '@nestjs/common';
import {
  PaginationInput,
  SortDirection,
} from '../../../../core/dto/pagination.request.dto';
import { Post, PostDocument, type PostModelType } from '../domain/post.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PostResponseDto } from '../dto/post.response.dto';

@Injectable()
export class PostsQwRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
  ) {}

  async findById(id: string): Promise<PostResponseDto | null> {
    const post = await this.PostModel.findById(id);
    if (!post) return null;
    return PostResponseDto.mapToView(post);
  }

  async findAll(
    paginationInput: PaginationInput,
  ): Promise<{ posts: PostDocument[]; totalCount: number }> {
    const sortBy = paginationInput.sortBy ?? 'createdAt';
    const sortDirection =
      paginationInput.sortDirection === SortDirection.Asc ? 1 : -1;
    const pageNumber = paginationInput.pageNumber ?? 1;
    const pageSize = paginationInput.pageSize ?? 10;

    const skip = (pageNumber - 1) * pageSize;
    const posts = await this.PostModel.find()
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize);

    const totalCount = await this.PostModel.countDocuments();

    return { posts, totalCount };
  }

  async findAllByBlogId(
    paginationInput: PaginationInput,
    blogId: string,
  ): Promise<{ posts: PostDocument[]; totalCount: number }> {
    const sortBy = paginationInput.sortBy ?? 'createdAt';
    const sortDirection =
      paginationInput.sortDirection === SortDirection.Asc ? 1 : -1;
    const pageNumber = paginationInput.pageNumber ?? 1;
    const pageSize = paginationInput.pageSize ?? 10;

    const skip = (pageNumber - 1) * pageSize;
    const posts = await this.PostModel.find({
      blogId: blogId,
    })
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize);

    const totalCount = await this.PostModel.countDocuments({ blogId: blogId });

    return { posts, totalCount };
  }
}
