import { BaseDbEntity } from '../../../../core/db/entities/base-db.entity';
import { BlogsPostgres } from '../../blogs/domain/blog-postgres.entity';
import { CommentPostgres } from '../../comments/domain/comment-postgres';
import {
  CreatePostForBlogRequestDto,
  CreatePostRequestDto,
} from '../dto/create-post.request.dto';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

export enum LikeStatus {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

@Entity({ name: 'posts' })
export class PostsPostgres extends BaseDbEntity {
  @Column({
    name: 'title',
    type: 'varchar',
    length: 30,
    unique: false,
  })
  title: string;

  @Column({
    name: 'short_description',
    type: 'varchar',
    length: 100,
    unique: false,
  })
  shortDescription: string;

  @Column({
    name: 'content',
    type: 'varchar',
    length: 1000,
    unique: false,
  })
  content: string;

  @Column({
    name: 'likes_count',
    type: 'integer',
    default: 0,
  })
  likesCount: number;

  @Column({
    name: 'dislikes_count',
    type: 'integer',
    default: 0,
  })
  dislikesCount: number;

  @ManyToOne(() => BlogsPostgres, (blog) => blog.id)
  @JoinColumn({ name: 'blog_id' })
  blog: BlogsPostgres;

  @OneToMany(() => CommentPostgres, (comment) => comment.post)
  comments: CommentPostgres[];

  static createInstance(
    dto: CreatePostRequestDto,
    blog: BlogsPostgres,
  ): PostsPostgres {
    const post = new PostsPostgres();
    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blog = blog;
    post.likesCount = 0;
    post.dislikesCount = 0;
    return post;
  }

  updatePost(dto: CreatePostForBlogRequestDto): void {
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
    this.updatedAt = new Date();
  }
}
