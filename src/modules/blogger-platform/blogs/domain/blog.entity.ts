import { Column, Entity, OneToMany } from 'typeorm';
import { CreateBlogRequestDto } from '../dto/create-blog.request.dto';
import { BaseDbEntity } from '../../../../core/db/entities/base-db.entity';
import { Post } from '../../posts/domain/post.entity';

@Entity({ name: 'blogs' })
export class Blog extends BaseDbEntity {
  @Column({
    name: 'name',
    type: 'varchar',
    length: 15,
    unique: false,
  })
  name: string;

  @Column({
    name: 'description',
    type: 'varchar',
    length: 500,
    unique: false,
  })
  description: string;

  @Column({
    name: 'website_url',
    type: 'varchar',
    length: 100,
    unique: false,
    nullable: true,
  })
  websiteUrl: string;

  @Column({
    name: 'is_membership',
    type: 'boolean',
  })
  isMembership: boolean;

  @OneToMany(() => Post, (post) => post.blog)
  posts: Post[];

  static createInstance(dto: CreateBlogRequestDto): Blog {
    const blog = new Blog();
    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    blog.isMembership = false;
    return blog;
  }

  updateBlog(dto: CreateBlogRequestDto): void {
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
  }
}
