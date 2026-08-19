import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityType } from '../types/entity-type.enum';
import { User } from '../../../user-accounts/domain/users/postgresql/user.postgres.entity';
import { CreateLikeEntityDto } from './dto/create-likes.entity.dto';
import { LikeStatus } from '../../../../core/types/like-status.enum';

@Entity({ name: 'likes' })
export class Like {
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

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

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

  static createInstance(dto: CreateLikeEntityDto, user: User): Like {
    const like = new Like();
    like.entityId = dto.entityId;
    like.entityType = dto.entityType;
    like.user = user;
    like.likeStatus = dto.likeStatus;
    return like;
  }

  changeStatus(status: LikeStatus): void {
    this.likeStatus = status;
    this.addedAt = new Date();
  }
}
