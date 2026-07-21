import { CreateCommentEntityDto } from '../dto/create-comment.entity.dto';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'comments' })
export class CommentPostgres {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'content',
    type: 'varchar',
    length: 300,
    unique: false,
    nullable: false,
  })
  content: string;
  @Column({
    name: 'user_id',
    type: 'uuid',
  })
  userId: string;
  @Column({
    name: 'user_login',
    type: 'varchar',
  })
  userLogin: string;
  @Column({
    name: 'post_id',
    type: 'uuid',
  })
  postId: string;
  @Column({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;
  @Column({
    name: 'updated_at',
    type: 'timestamptz',
    nullable: true,
  })
  updatedAt: Date;
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

  static createInstance(
    dto: CreateCommentEntityDto,
    postId: string,
  ): CommentPostgres {
    const comment = new CommentPostgres();
    comment.content = dto.content;
    comment.postId = postId;
    comment.userId = dto.userId;
    comment.userLogin = dto.userLogin;
    comment.createdAt = new Date();
    return comment;
  }

  changeContent(content: string) {
    this.content = content;
    this.updatedAt = new Date();
  }
}
