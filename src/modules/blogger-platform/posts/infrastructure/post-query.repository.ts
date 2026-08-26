import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../domain/post.entity';
import { PostResponseDto } from '../dto/post.response.dto';
import {
  PaginationInput,
  SortDirection,
} from '../../../../core/dto/pagination.request.dto';

@Injectable()
export class PostQwRepository {
  constructor(
    @InjectRepository(Post)
    private postRepo: Repository<Post>,
  ) {}

  async findById(id: string): Promise<PostResponseDto | null> {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post) return null;
    return PostResponseDto.mapToView(post);
  }

  async findAll(
    pagination: PaginationInput,
  ): Promise<{ posts: Post[]; totalCount: number }> {
    const sortBy = pagination.sortBy ?? 'createdAt';
    const sortDirection =
      pagination.sortDirection === SortDirection.Asc ? 'ASC' : 'DESC';
    const pageNumber = pagination.pageNumber ?? 1;
    const pageSize = pagination.pageSize ?? 10;
    const offset = (pageNumber - 1) * pageSize;

    const queryBuilder = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.blog', 'blog');

    if (sortBy === 'blogName') {
      queryBuilder.orderBy('blog.name', sortDirection);
    } else {
      queryBuilder.orderBy(`post.${sortBy}`, sortDirection);
    }

    queryBuilder.skip(offset).take(pageSize);

    const [posts, totalCount] = await queryBuilder.getManyAndCount();

    return {
      posts: posts,
      totalCount: totalCount,
    };
  }

  async findAllByBlogId(
    pagination: PaginationInput,
    blogId: string,
  ): Promise<{ posts: Post[]; totalCount: number }> {
    const sortBy = pagination.sortBy ?? 'createdAt';
    const sortDirection =
      pagination.sortDirection === SortDirection.Asc
        ? SortDirection.Asc
        : SortDirection.Desc;
    const pageNumber = pagination.pageNumber ?? 1;
    const pageSize = pagination.pageSize ?? 10;
    const offset = (pageNumber - 1) * pageSize;

    const [posts, totalCount] = await this.postRepo.findAndCount({
      where: { blog: { id: blogId } },
      order: { [sortBy]: sortDirection },
      skip: offset,
      take: pageSize,
      relations: { blog: true },
    });

    return {
      posts: posts,
      totalCount: totalCount,
    };
  }
}
