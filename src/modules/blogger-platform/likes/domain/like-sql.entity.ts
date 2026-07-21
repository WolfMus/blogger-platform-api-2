import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityType } from '../types/entity-type.enum';
import { LikeStatus } from '../../../../core/types/like-status.enum';
import { UserPostgres } from '../../../user-accounts/domain/users/postgresql/user.postgres.entity';

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
    type: 'varchar',
  })
  likeStatus: LikeStatus;

  @Column({
    name: 'added_at',
    type: 'timestamptz',
  })
  addedAt: Date;
}
