import {
  CreatePostForBlogRequestDto,
  CreatePostRequestDto,
} from '../dto/create-post.request.dto';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum LikeStatus {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

@Entity({ name: 'posts' })
export class PostsPostgres {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
    name: 'blog_id',
    type: 'uuid',
  })
  blogId: string;

  @Column({
    name: 'blog_name',
    type: 'varchar',
  })
  blogName: string;

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

  static createInstance(
    dto: CreatePostRequestDto,
    blogName: string,
  ): PostsPostgres {
    const post = new PostsPostgres();
    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = dto.blogId;
    post.blogName = blogName;
    post.createdAt = new Date();
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
