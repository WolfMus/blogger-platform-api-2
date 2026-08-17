import { BaseDbEntity } from '../../../../core/db/entities/base-db.entity';
import { UserPostgres } from '../../../user-accounts/domain/users/postgresql/user.postgres.entity';
import { PostsPostgres } from '../../posts/domain/post-postgres.entity';
import { CreateCommentEntityDto } from '../dto/create-comment.entity.dto';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'comments' })
export class CommentPostgres extends BaseDbEntity {
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
  @ManyToOne(() => UserPostgres, (user) => user.comments)
  @JoinColumn({ name: 'user_id' })
  user: UserPostgres;
  @ManyToOne(() => PostsPostgres, (post) => post.comments)
  @JoinColumn({ name: 'post_id' })
  post: PostsPostgres;

  static createInstance(
    dto: CreateCommentEntityDto,
    user: UserPostgres,
    post: PostsPostgres,
  ): CommentPostgres {
    const comment = new CommentPostgres();
    comment.content = dto.content;
    comment.user = user;
    comment.post = post;
    return comment;
  }

  changeContent(content: string) {
    this.content = content;
  }
}
