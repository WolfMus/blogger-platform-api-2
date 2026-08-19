import { LikeStatus } from '../../../../../core/types/like-status.enum';
import { EntityType } from '../../types/entity-type.enum';

export class CreateLikeEntityDto {
  entityId: string;
  entityType: EntityType;
  likeStatus: LikeStatus;
}
