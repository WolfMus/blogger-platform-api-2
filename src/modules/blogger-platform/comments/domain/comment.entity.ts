import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LikeStatus } from '../../posts/domain/post.entity';
import { HydratedDocument, Model } from 'mongoose';
import { CreateCommentEntityDto } from '../dto/create-comment.entity.dto';

@Schema({ _id: false, collection: 'commentator-info' })
class CommentatorInfo {
  @Prop({ type: String, required: true })
  userId: string;
  @Prop({ type: String, required: true })
  userLogin: string;
}

@Schema({ _id: false, collection: 'likes-info' })
class LikesInfo {
  @Prop({ type: Number, default: 0 })
  likesCount: number;
  @Prop({ type: Number, default: 0 })
  dislikesCount: number;
  @Prop({ type: String, enum: LikeStatus, default: LikeStatus.None })
  myStatus: LikeStatus;
}

@Schema({ collection: 'comment' })
export class Comment {
  @Prop({ type: String, required: true })
  content: string;
  @Prop({ type: CommentatorInfo, required: true })
  commentatorInfo: CommentatorInfo;
  @Prop({ type: String, required: true })
  postId: string;
  @Prop({ type: Date, required: true })
  createdAt: Date;
  @Prop({ type: LikesInfo, default: () => ({}) })
  likesInfo: LikesInfo;

  static createInstance(
    dto: CreateCommentEntityDto,
    postId: string,
  ): CommentDocument {
    const comment = new this();
    comment.content = dto.content;
    comment.postId = postId;
    comment.commentatorInfo = {
      userId: dto.userId,
      userLogin: dto.userLogin,
    };
    comment.createdAt = new Date();
    return comment as CommentDocument;
  }

  changeContent(content: string) {
    this.content = content;
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

// регистрирует методы сущности в схеме
CommentSchema.loadClass(Comment);

// типизация документа
export type CommentDocument = HydratedDocument<Comment>;

// типизация модели + статические методы
export type CommentModelType = Model<CommentDocument> & typeof Comment;
