import { BaseDbEntity } from '../../../../core/db/entities/base-db.entity';
import { Blog } from '../../blogs/domain/blog.entity';
import { Comment } from '../../comments/domain/comment.entity';
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
export class Post extends BaseDbEntity {
  @Column({
    name: 'title',
    type: 'varchar',
    length: 30,
    unique: false,
  })
  title: string;

  @Column({
    name: 'shortDescription',
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
    name: 'likesCount',
    type: 'integer',
    default: 0,
  })
  likesCount: number;

  @Column({
    name: 'dislikesCount',
    type: 'integer',
    default: 0,
  })
  dislikesCount: number;

  @ManyToOne(() => Blog, (blog) => blog.id)
  @JoinColumn({ name: 'blogId' })
  blog: Blog;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  static createInstance(dto: CreatePostRequestDto, blog: Blog): Post {
    const post = new Post();
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
  }
}
