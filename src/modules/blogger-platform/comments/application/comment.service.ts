import { HttpStatus, Injectable } from '@nestjs/common';
import { CommentResponseDto } from '../dto/comment.response.dto';
import { CommentMapper } from '../dto/mapper/comment.response.mapper';
import { PaginationInput } from '../../../../core/dto/pagination.request.dto';
import { PaginatedCommentResponseDto } from '../dto/paginated-comment.response.dto';
import {
  DomainException,
  Extension,
} from '../../../../core/exceptions/domain-exception';
import { PostRepository } from '../../posts/infrastructure/post.repository';
import { CommentRepository } from '../infrastructure/comment.repository';
import { LikeRepository } from '../../likes/infrastructure/like.repository';

@Injectable()
export class CommentService {
  constructor(
    private commentRepo: CommentRepository,
    private commentMapper: CommentMapper,
    private likeRepo: LikeRepository,
    private postRepo: PostRepository,
  ) {}

  async findById(
    id: string,
    userId: string | null,
  ): Promise<CommentResponseDto> {
    const comment = await this.commentRepo.findById(id);
    if (!comment) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Comment', 'Comment Not Found')],
      });
    }
    if (!userId) {
      return this.commentMapper.toResponsePostgresView(comment);
    }

    const like = await this.likeRepo.findByEntityIdAndUserId(id, userId);
    if (!like) {
      return this.commentMapper.toResponsePostgresView(comment);
    }
    return this.commentMapper.toResponsePostgresView(comment, like.likeStatus);
  }

  // async findAll(
  //   paginationInput: PaginationInput,
  // ): Promise<PaginatedCommentResponseDto> {
  //   const { comments, totalCount } =
  //     await this.commentRepo.findAll(paginationInput);
  //   return this.commentMapper.toResponsePaginatedView(
  //     comments,
  //     paginationInput,
  //     totalCount,
  //   );
  // }

  async findAllByPostId(
    paginationInput: PaginationInput,
    postId: string,
    userId: string | null = null,
  ): Promise<PaginatedCommentResponseDto> {
    const post = await this.postRepo.findById(postId);
    if (!post) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Post not found',
        extensions: [new Extension('Post not found', 'postId')],
      });
    }
    const { comments, totalCount } = await this.commentRepo.findAllByPostId(
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
      return this.commentMapper.toResponsePaginatedPostgresView(
        comments,
        paginationInput,
        totalCount,
      );
    }

    const commentsIds = comments.map((comment) => {
      return comment.id.toString();
    });
    const statuses = await this.likeRepo.findLikeStatuses(commentsIds, userId);
    if (!statuses) {
      return this.commentMapper.toResponsePaginatedPostgresView(
        comments,
        paginationInput,
        totalCount,
      );
    }
    // const statusMap: Record<string, LikeStatus> = Object.fromEntries(statuses);
    return this.commentMapper.toResponsePaginatedPostgresView(
      comments,
      paginationInput,
      totalCount,
      statuses,
    );
  }

  async delete(id: string, userId: string): Promise<void> {
    const comment = await this.commentRepo.findById(id);
    if (!comment) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Comment Not Found', 'id')],
      });
    }
    if (comment.user.id !== userId) {
      throw new DomainException({
        code: HttpStatus.FORBIDDEN,
        message: 'Forbidden',
        extensions: [new Extension('Wrong user id', 'userId')],
      });
    }
    const commentDeleted = await this.commentRepo.delete(id);
    if (commentDeleted === null) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Comment Not Found', 'id')],
      });
    }
    return;
  }
}
