import { BaseDbEntity } from '../../../../core/db/entities/base-db.entity';
import { User } from '../../../user-accounts/domain/users/postgresql/user.postgres.entity';
import { Post } from '../../posts/domain/post.entity';
import { CreateCommentEntityDto } from '../dto/create-comment.entity.dto';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'comments' })
export class Comment extends BaseDbEntity {
  @Column({
    name: 'content',
    type: 'varchar',
    length: 300,
    unique: false,
    nullable: false,
  })
  content: string;
  @Column({
    name: 'likes_count',
    type: 'int',
    default: 0,
  })
  likesCount: number;
  @Column({
    name: 'dislikes_count',
    type: 'int',
    default: 0,
  })
  dislikesCount: number;
  @ManyToOne(() => User, (user) => user.comments)
  @JoinColumn({ name: 'user_id' })
  user: User;
  @ManyToOne(() => Post, (post) => post.comments)
  @JoinColumn({ name: 'post_id' })
  post: Post;

  static createInstance(
    dto: CreateCommentEntityDto,
    user: User,
    post: Post,
  ): Comment {
    const comment = new Comment();
    comment.content = dto.content;
    comment.user = user;
    comment.post = post;
    return comment;
  }

  changeContent(content: string) {
    this.content = content;
  }
}
