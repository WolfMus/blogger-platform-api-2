import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from '../domain/comment.entity';
import type { CommentModelType } from '../domain/comment.entity';
import {
  PaginationInput,
  SortDirection,
} from '../../../../core/dto/pagination.request.dto';
import {
  DomainException,
  Extension,
} from '../../../../core/exceptions/domain-exception';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
  ) {}

  async findById(id: string): Promise<CommentDocument | null> {
    const comment = await this.CommentModel.findById(id);
    if (!comment) return null;
    return comment;
  }

  async findAll(
    paginationInput: PaginationInput,
  ): Promise<{ comments: CommentDocument[]; totalCount: number }> {
    const sortBy = paginationInput.sortBy ?? 'createdAt';
    const sortDirection =
      paginationInput.sortDirection === SortDirection.Asc ? 1 : -1;
    const pageNumber = paginationInput.pageNumber ?? 1;
    const pageSize = paginationInput.pageSize ?? 10;
    const skip = (pageNumber - 1) * pageSize;

    const comments = await this.CommentModel.find()
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize);

    const totalCount = await this.CommentModel.countDocuments();

    return { comments, totalCount };
  }

  async findAllForPost(
    paginationInput: PaginationInput,
    postId: string,
  ): Promise<{ comments: CommentDocument[]; totalCount: number }> {
    const sortBy = paginationInput.sortBy ?? 'createdAt';
    const sortDirection =
      paginationInput.sortDirection === SortDirection.Asc ? 1 : -1;
    const pageNumber = paginationInput.pageNumber ?? 1;
    const pageSize = paginationInput.pageSize ?? 10;

    const skip = (pageNumber - 1) * pageSize;
    const comments = await this.CommentModel.find({ postId: postId })
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize);

    const totalCount = await this.CommentModel.countDocuments({
      postId: postId,
    });

    return { comments, totalCount };
  }

  async save(comment: CommentDocument): Promise<void> {
    await comment.save();
    return;
  }

  async delete(id: string): Promise<void> {
    const comment = await this.CommentModel.findByIdAndDelete(id);
    if (!comment) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Comment Not Found', 'id')],
      });
    }
    return;
  }

  async changeCounts(
    deltaLike: number,
    deltaDislike: number,
    id: string,
  ): Promise<void> {
    await this.CommentModel.findOneAndUpdate(
      { _id: id },
      {
        $inc: {
          'likesInfo.likesCount': deltaLike,
          'likesInfo.dislikesCount': deltaDislike,
        },
      },
    );
    return;
  }
}
