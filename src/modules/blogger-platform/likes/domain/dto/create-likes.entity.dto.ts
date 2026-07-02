import { LikeStatus } from '../../../posts/domain/post.entity';
import { EntityType } from '../like.entity';

export class CreateLikeEntityDto {
  entityId: string;
  entityType: EntityType;
  userId: string;
  userLogin: string;
  likeStatus: LikeStatus;
}
