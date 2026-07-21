import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LikeStatus } from '../../posts/domain/post.entity';
import { HydratedDocument, Model } from 'mongoose';
import { CreateLikeEntityDto } from './dto/create-likes.entity.dto';
import { EntityType } from '../types/entity-type.enum';

@Schema({ collection: 'likes' })
export class Like {
  @Prop({ type: String, required: true })
  entityId: string;
  @Prop({ type: String, enum: EntityType, required: true })
  entityType: EntityType;
  @Prop({ type: String, required: true })
  userId: string;
  @Prop({ type: String, required: true })
  userLogin: string;
  @Prop({ type: String, enum: LikeStatus, required: true })
  likeStatus: LikeStatus;
  @Prop({ type: Date, required: true })
  addedAt: Date;

  static createInstance(dto: CreateLikeEntityDto): LikeDocument {
    const like = new this();
    like.entityId = dto.entityId;
    like.entityType = dto.entityType;
    like.userId = dto.userId;
    like.userLogin = dto.userLogin;
    like.likeStatus = dto.likeStatus;
    like.addedAt = new Date();
    return like as LikeDocument;
  }

  changeStatus(status: LikeStatus): void {
    this.likeStatus = status;
  }
}

export const LikeSchema = SchemaFactory.createForClass(Like);

// регистрирует методы сущности в схеме
LikeSchema.loadClass(Like);

// типизация документа
export type LikeDocument = HydratedDocument<Like>;

// типизация модели + статические методы
export type LikeModelType = Model<LikeDocument> & typeof Like;
