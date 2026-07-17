import { HttpStatus, Injectable } from '@nestjs/common';
import { LikeStatus, NewestLikes } from '../domain/post.entity';
import { PostMapper } from '../dto/mapper/post.response.mapper';
import { PostResponseDto } from '../dto/post.response.dto';
import { PaginationInput } from '../../../../core/dto/pagination.request.dto';
import { PaginatedPostResponseDto } from '../dto/post-paginated-view.response.dto';
import {
  DomainException,
  Extension,
} from '../../../../core/exceptions/domain-exception';
import { LikesRepository } from '../../likes/infrastructure/likes.repository';
import { PostsQwPostgresRepository } from '../infrastructure/postgres/posts-query-postgres.repository';
import { PostsPostgresRepository } from '../infrastructure/postgres/posts-postgres.repository';

@Injectable()
export class PostsService {
  constructor(
    private postsPostgresRepo: PostsPostgresRepository,
    private postsQueryPostRepo: PostsQwPostgresRepository,
    private postMapper: PostMapper,
    private likesRepo: LikesRepository,
  ) {}

  async findAll(
    paginationInput: PaginationInput,
    userId: string | null,
  ): Promise<PaginatedPostResponseDto> {
    // Получение постов и totalCount
    const { posts, totalCount } =
      await this.postsQueryPostRepo.findAll(paginationInput);
    const postsMapped = posts.map((p) => this.postMapper.toResponseDtoView(p));

    // Сбор ID постов для поиска лайков
    const postsIds = postsMapped.map((post) => {
      return post.id.toString();
    });

    // Получение последних 3 лайков для каждого поста
    const likes = await this.likesRepo.findNewestLikesForPosts(postsIds);

    // Проверка userId в JWT
    if (userId) {
      // Статусы лайков текущего пользователя
      const statuses = await this.likesRepo.findEntityIdAndLikeStatus(
        postsIds,
        userId,
      );

      if (!statuses) {
        return this.postMapper.toResponsePaginatedView(
          postsMapped,
          paginationInput,
          totalCount,
          likes,
        );
      }

      // Преобразование статусов в Map (массив пар -> объект)
      const statusMap: Record<string, LikeStatus> =
        Object.fromEntries(statuses);

      // Возврат со статусами пользователей
      return this.postMapper.toResponsePaginatedView(
        postsMapped,
        paginationInput,
        totalCount,
        likes,
        statusMap,
      );
    }

    // Возврат без статусов пользователя
    return this.postMapper.toResponsePaginatedView(
      postsMapped,
      paginationInput,
      totalCount,
      likes,
    );
  }

  async findAllByBlogId(
    paginationInput: PaginationInput,
    blogId: string,
    userId: string,
  ): Promise<PaginatedPostResponseDto> {
    // Получение постов и totalCount
    const { posts, totalCount } = await this.postsQueryPostRepo.findAllByBlogId(
      paginationInput,
      blogId,
    );
    const postsMapped = posts.map((p) => this.postMapper.toResponseDtoView(p));

    // Сбор ID постов для поиска лайков
    const postsIds = postsMapped.map((post) => {
      return post.id.toString();
    });

    // Получение последних 3 лайков для каждого поста
    const likes = await this.likesRepo.findNewestLikesForPosts(postsIds);

    // Проверка userId в JWT
    if (userId) {
      // Статусы лайков текущего пользователя
      const statuses = await this.likesRepo.findEntityIdAndLikeStatus(
        postsIds,
        userId,
      );

      if (!statuses) {
        return this.postMapper.toResponsePaginatedView(
          postsMapped,
          paginationInput,
          totalCount,
          likes,
        );
      }

      // Преобразование статусов в Map (массив пар -> объект)
      const statusMap: Record<string, LikeStatus> =
        Object.fromEntries(statuses);

      // Возврат со статусами пользователей
      return this.postMapper.toResponsePaginatedView(
        postsMapped,
        paginationInput,
        totalCount,
        likes,
        statusMap,
      );
    }

    // Возврат без статусов пользователя
    return this.postMapper.toResponsePaginatedView(
      postsMapped,
      paginationInput,
      totalCount,
      likes,
    );
  }

  async findById(id: string, userId: string | null): Promise<PostResponseDto> {
    // Существование поста
    const post = await this.postsPostgresRepo.findById(id);
    if (!post) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Post Not Found', 'id')],
      });
    }
    // Последние 3 лайка
    const likes = await this.likesRepo.findNewestLikesByEntityId(id);
    const newestLikes: NewestLikes[] =
      likes?.map((l) => {
        return {
          login: l.userLogin,
          userId: l.userId,
          addedAt: l.addedAt,
        };
      }) || [];
    // Прверка userId в JWT
    if (!userId)
      return this.postMapper.toResponseView(post, newestLikes, LikeStatus.None);
    // Статус лайка для поста
    const isLiked = await this.likesRepo.findByEntityIdAndUserId(id, userId);
    if (!isLiked) {
      return this.postMapper.toResponseView(post, newestLikes, LikeStatus.None);
    }

    return this.postMapper.toResponseView(
      post,
      newestLikes,
      isLiked.likeStatus,
    );
  }

  // async create(
  //   dto: CreatePostRequestDto,
  //   blogName: string,
  // ): Promise<PostResponseDto> {
  //   const post = PostsPostgres.createInstance(dto, blogName);
  //   await this.postsPostgresRepo.save(post);
  //   return this.postMapper.toResponseView(post);
  // }

  // async createForBlog(
  //   dto: CreatePostForBlogRequestDto,
  //   blogId: string,
  //   blogName: string,
  // ): Promise<PostResponseDto> {
  //   const postData: CreatePostRequestDto = {
  //     ...dto,
  //     blogId,
  //   };
  //   const post = PostsPostgres.createInstance(postData, blogName);
  //   await this.postsPostgresRepo.save(post);
  //   return this.postMapper.toResponseView(post);
  // }
}
