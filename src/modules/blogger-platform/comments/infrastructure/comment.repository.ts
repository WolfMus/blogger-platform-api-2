/* eslint-disable quotes */
import { Injectable } from '@nestjs/common';
import {
  PaginationInput,
  SortDirection,
} from '../../../../core/dto/pagination.request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../domain/comment.entity';

@Injectable()
export class CommentRepository {
  constructor(
    @InjectRepository(Comment)
    private commentRepo: Repository<Comment>,
  ) {}

  async findById(id: string): Promise<Comment | null> {
    const comment = await this.commentRepo.findOne({
      where: { id: id },
      relations: { user: true },
    });
    if (!comment) return null;
    return comment;
  }

  async findAllByPostId(
    pagination: PaginationInput,
    postId: string,
  ): Promise<{ comments: Comment[]; totalCount: number }> {
    const sortBy = pagination.sortBy ?? 'createdAt';
    const sortDirection =
      pagination.sortDirection === SortDirection.Asc
        ? SortDirection.Asc
        : SortDirection.Desc;
    const pageNumber = pagination.pageNumber ?? 1;
    const pageSize = pagination.pageSize ?? 10;
    const offset = (pageNumber - 1) * pageSize;

    const [comments, totalCount] = await this.commentRepo.findAndCount({
      where: { post: { id: postId } },
      order: { [sortBy]: sortDirection },
      skip: offset,
      take: pageSize,
      relations: { user: true },
    });

    return {
      comments: comments,
      totalCount: totalCount,
    };
  }

  async save(comment: Comment): Promise<Comment | null> {
    const saved = await this.commentRepo.save(comment);
    if (!saved) return null;
    return saved;
  }

  async delete(id: string): Promise<void | null> {
    const deleted = await this.commentRepo.delete({ id: id });
    if (deleted.affected === 0) {
      return null;
    }
    return;
  }

  async changeCounts(
    deltaLike: number,
    deltaDislike: number,
    id: string,
  ): Promise<boolean> {
    const result = await this.commentRepo
      .createQueryBuilder()
      .update()
      .set({
        likesCount: () => `"likes_count" + :deltaLike`,
        dislikesCount: () => `"dislikes_count" + :deltaDislike`,
      })
      .where(`id = :id`)
      .setParameters({
        id,
        deltaLike,
        deltaDislike,
      })
      .execute();
    return result.affected === 1;
  }
}
