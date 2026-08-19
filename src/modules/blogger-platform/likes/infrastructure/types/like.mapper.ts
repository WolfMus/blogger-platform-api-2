import { User } from '../../../../user-accounts/domain/users/postgresql/user.postgres.entity';
import { Like } from '../../domain/like.entity';
import { LikeRow } from './like-row.type';

export class LikeMapper {
  static toDomain(row: LikeRow): Like {
    const like = new Like();
    like.id = row.id;
    like.entityId = row.entityId;
    like.entityType = row.entityType;
    like.user = { id: row.userId } as User;
    // like.userLogin = row.userLogin;
    like.addedAt = row.addedAt;
    like.likeStatus = row.likeStatus;
    return like;
  }
}
