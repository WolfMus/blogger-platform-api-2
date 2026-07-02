import { HttpStatus, Injectable } from '@nestjs/common';
import { CommentResponseDto } from '../dto/comment.response.dto';
import { CommentsRepository } from '../infrastructure/comments.repository';
import { CommentMapper } from '../dto/mapper/comment.response.mapper';
import { PaginationInput } from '../../../../core/dto/pagination.request.dto';
import { PaginatedCommentResponseDto } from '../dto/paginated-comment.response.dto';
import {
  DomainException,
  Extension,
} from '../../../../core/exceptions/domain-exception';
import { LikesRepository } from '../../likes/infrastructure/likes.repository';
import { LikeStatus } from '../../posts/domain/post.entity';
import { PostsRepository } from '../../posts/infrastructure/posts.repository';

@Injectable()
export class CommentsService {
  constructor(
    private commentsRepo: CommentsRepository,
    private commentMapper: CommentMapper,
    private likesRepo: LikesRepository,
    private postsRepo: PostsRepository,
  ) {}

  async findById(
    id: string,
    userId: string | null,
  ): Promise<CommentResponseDto> {
    const comment = await this.commentsRepo.findById(id);
    if (!comment) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Comment', 'Comment Not Found')],
      });
    }
    if (!userId) {
      return this.commentMapper.toResponseView(comment);
    }

    const like = await this.likesRepo.findByEntityIdAndUserId(id, userId);
    if (!like) {
      return this.commentMapper.toResponseView(comment);
    }
    return this.commentMapper.toResponseView(comment, like.likeStatus);
  }

  async findAll(
    paginationInput: PaginationInput,
  ): Promise<PaginatedCommentResponseDto> {
    const { comments, totalCount } =
      await this.commentsRepo.findAll(paginationInput);
    return this.commentMapper.toResponsePaginatedView(
      comments,
      paginationInput,
      totalCount,
    );
  }

  async findAllForPost(
    paginationInput: PaginationInput,
    postId: string,
    userId: string | null = null,
  ): Promise<PaginatedCommentResponseDto> {
    const post = await this.postsRepo.findById(postId);
    if (!post) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Post not found',
        extensions: [new Extension('Post not found', 'postId')],
      });
    }
    const { comments, totalCount } = await this.commentsRepo.findAllForPost(
      paginationInput,
      postId,
    );

    if (!comments) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Comments Not Found', 'postId')],
      });
    }

    if (!userId) {
      return this.commentMapper.toResponsePaginatedView(
        comments,
        paginationInput,
        totalCount,
      );
    }

    const commentsIds = comments.map((comment) => {
      return comment._id.toString();
    });
    const statuses = await this.likesRepo.findEntityIdAndLikeStatus(
      commentsIds,
      userId,
    );
    if (!statuses) {
      return this.commentMapper.toResponsePaginatedView(
        comments,
        paginationInput,
        totalCount,
      );
    }
    const statusMap: Record<string, LikeStatus> = Object.fromEntries(statuses);
    return this.commentMapper.toResponsePaginatedView(
      comments,
      paginationInput,
      totalCount,
      statusMap,
    );
  }

  async delete(id: string, userId: string): Promise<void> {
    const comment = await this.commentsRepo.findById(id);
    if (!comment) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Comment Not Found', 'id')],
      });
    }
    if (comment?.commentatorInfo.userId !== userId) {
      throw new DomainException({
        code: HttpStatus.FORBIDDEN,
        message: 'Forbidden',
        extensions: [new Extension('Wrong user id', 'userId')],
      });
    }
    return await this.commentsRepo.delete(id);
  }
}
