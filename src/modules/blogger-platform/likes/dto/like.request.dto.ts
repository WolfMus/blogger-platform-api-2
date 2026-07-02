import { IsEnum } from 'class-validator';
import { LikeStatus } from '../../posts/domain/post.entity';

export class LikeRequestDto {
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus;
}
