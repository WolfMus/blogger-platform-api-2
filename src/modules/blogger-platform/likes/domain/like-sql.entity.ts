import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityType } from '../types/entity-type.enum';
import { UserPostgres } from '../../../user-accounts/domain/users/postgresql/user.postgres.entity';
import { CreateLikeEntityDto } from './dto/create-likes.entity.dto';
import { LikeStatus } from '../../../../core/types/like-status.enum';

@Entity({ name: 'likes' })
export class LikePostgres {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'entity_id',
    type: 'uuid',
  })
  entityId: string;

  @Column({
    name: 'entity_type',
    type: 'enum',
    enum: EntityType,
  })
  entityType: EntityType;

  @ManyToOne(() => UserPostgres)
  @JoinColumn({ name: 'user_id' })
  user: UserPostgres;

  @Column({
    name: 'user_login',
    type: 'varchar',
  })
  userLogin: string;

  @Column({
    name: 'like_status',
    type: 'enum',
    enum: LikeStatus,
  })
  likeStatus: LikeStatus;

  @Column({
    name: 'added_at',
    type: 'timestamptz',
  })
  addedAt: Date;

  static createInstance(dto: CreateLikeEntityDto): LikePostgres {
    const like = new LikePostgres();
    like.entityId = dto.entityId;
    like.entityType = dto.entityType;
    like.user = { id: dto.userId } as UserPostgres;
    like.userLogin = dto.userLogin;
    like.likeStatus = dto.likeStatus;
    like.addedAt = new Date();
    return like;
  }

  changeStatus(status: LikeStatus): void {
    this.likeStatus = status;
    this.addedAt = new Date();
  }
}
