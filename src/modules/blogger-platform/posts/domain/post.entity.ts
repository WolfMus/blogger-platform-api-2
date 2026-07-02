import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CreatePostRequestDto } from '../dto/create-post.request.dto';
import { HydratedDocument, Model } from 'mongoose';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';

export enum LikeStatus {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

@ApiSchema({ name: 'NewestLikes' })
@Schema({ _id: false })
export class NewestLikes {
  @ApiProperty()
  @Prop({ type: Date, required: true })
  addedAt: Date;

  @ApiProperty()
  @Prop({ type: String, required: true })
  userId: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  login: string;
}

@ApiSchema({ name: 'ExtendedLikesInfo' })
@Schema({ _id: false })
export class ExtendedLikesInfo {
  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  likesCount: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  dislikesCount: number;

  @ApiProperty()
  @Prop({ type: String, enum: LikeStatus, default: LikeStatus.None })
  myStatus: string;

  @ApiProperty({ type: NewestLikes })
  @Prop({ type: [NewestLikes], default: [] })
  newestLikes: NewestLikes[];
}

@ApiSchema({ name: 'Post Entity' })
@Schema({ collection: 'posts' })
export class Post {
  @ApiProperty()
  @Prop({ type: String, required: true })
  title: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  shortDescription: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  content: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  blogId: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  blogName: string;

  @ApiProperty()
  @Prop({ type: Date, required: true })
  createdAt: Date;

  @ApiProperty()
  @Prop({ type: Date, default: null })
  updatedAt: Date;

  @ApiProperty({ type: ExtendedLikesInfo })
  @Prop({ type: ExtendedLikesInfo })
  extendedLikesInfo: ExtendedLikesInfo;

  static createInstance(
    dto: CreatePostRequestDto,
    blogName: string,
  ): PostDocument {
    const post = new this();
    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = dto.blogId;
    post.blogName = blogName;
    post.createdAt = new Date();
    post.extendedLikesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: LikeStatus.None,
      newestLikes: [],
    };
    return post as PostDocument;
  }

  updatePost(dto: CreatePostRequestDto): void {
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
    this.blogId = dto.blogId;
    this.updatedAt = new Date();
    return;
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);

// регистрирует методы сущности в схеме
PostSchema.loadClass(Post);

// типизация документа
export type PostDocument = HydratedDocument<Post>;

// типизация модели + статические методы
export type PostModelType = Model<PostDocument> & typeof Post;
