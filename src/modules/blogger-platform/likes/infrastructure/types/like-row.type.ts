import { LikeStatus } from '../../../../../core/types/like-status.enum';
import { EntityType } from '../../types/entity-type.enum';

export interface LikeRow {
  id: string;
  entityId: string;
  entityType: EntityType;
  userId: string;
  userLogin: string;
  addedAt: Date;
  likeStatus: LikeStatus;
}
