import { UserPostgres } from '../../../../user-accounts/domain/users/postgresql/user.postgres.entity';
import { LikePostgres } from '../../domain/like-sql.entity';
import { LikeRow } from './like-row.type';

export class LikeMapper {
  static toDomain(row: LikeRow): LikePostgres {
    const like = new LikePostgres();
    like.id = row.id;
    like.entityId = row.entityId;
    like.entityType = row.entityType;
    like.user = { id: row.userId } as UserPostgres;
    like.userLogin = row.userLogin;
    like.addedAt = row.addedAt;
    like.likeStatus = row.likeStatus;
    return like;
  }
}
