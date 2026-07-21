import { LikeStatus } from '../../../posts/domain/post.entity';
import { EntityType } from '../../types/entity-type.enum';

export class CreateLikeEntityDto {
  entityId: string;
  entityType: EntityType;
  userId: string;
  userLogin: string;
  likeStatus: LikeStatus;
}
