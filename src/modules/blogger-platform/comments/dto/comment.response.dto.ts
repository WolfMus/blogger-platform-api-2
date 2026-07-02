import { Prop } from '@nestjs/mongoose';
import { LikeStatus } from '../../posts/domain/post.entity';
import { ApiProperty } from '@nestjs/swagger';

class CommentatorInfoResponseDto {
  @ApiProperty()
  @Prop({ type: String, required: true })
  userId: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  userLogin: string;
}

class LikesInfoResponseDto {
  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  likesCount: number;

  @ApiProperty()
  @Prop({ type: Number, default: 0 })
  dislikesCount: number;

  @ApiProperty({ enum: LikeStatus })
  @Prop({ type: String, enum: LikeStatus, default: LikeStatus.None })
  myStatus: LikeStatus;
}

export class CommentResponseDto {
  @ApiProperty()
  @Prop({ type: String, required: true })
  id: string;

  @ApiProperty()
  @Prop({ type: String, required: true })
  content: string;

  @ApiProperty()
  @Prop({ type: CommentatorInfoResponseDto, required: true })
  commentatorInfo: CommentatorInfoResponseDto;

  @ApiProperty()
  @Prop({ type: Date, required: true })
  createdAt: Date;

  @ApiProperty()
  @Prop({ type: LikesInfoResponseDto, required: true })
  likesInfo: LikesInfoResponseDto;
}
