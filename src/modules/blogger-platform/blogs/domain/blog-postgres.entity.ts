import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CreateBlogRequestDto } from '../dto/create-blog.request.dto';

@Entity()
export class BlogsPostgres {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
    name: 'websiteUrl',
    type: 'varchar',
    length: 100,
    unique: false,
  })
  websiteUrl: string;

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
  updatedAt: Date | null;

  @Column({
    name: 'is_membership',
    type: 'boolean',
  })
  isMembership: boolean;

  static createInstance(dto: CreateBlogRequestDto): BlogsPostgres {
    const blog = new BlogsPostgres();
    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    blog.createdAt = new Date();
    blog.updatedAt = null;
    blog.isMembership = false;
    return blog;
  }

  updateBlog(dto: CreateBlogRequestDto): void {
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
    this.updatedAt = new Date();
  }
}
