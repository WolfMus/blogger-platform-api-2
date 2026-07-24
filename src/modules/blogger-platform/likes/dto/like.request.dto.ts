import { IsEnum } from 'class-validator';
import { LikeStatus } from '../../../../core/types/like-status.enum';

export class LikeRequestDto {
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus;
}
