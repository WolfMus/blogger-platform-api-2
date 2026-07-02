import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateBlogRequestDto } from '../dto/create-blog.request.dto';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
@ApiSchema({
  name: 'Blog Entity',
})
@Schema({ collection: 'blogs' })
export class Blog {
  @ApiProperty({ example: 'Pineapple', description: 'Blogs name' })
  @Prop({ type: String, required: true })
  name: string;

  @ApiProperty({
    example: 'This blog is about pineapples',
    description: 'Blogs description',
  })
  @Prop({ type: String, required: true })
  description: string;

  @ApiProperty({
    example: 'https://pineapples.by',
    description: 'Website URL',
  })
  @Prop({ type: String, required: true })
  websiteUrl: string;

  @ApiProperty({
    description: 'Сreation date',
  })
  @Prop({ type: Date, required: true })
  createdAt: Date;

  @ApiProperty({
    description: 'Update date',
  })
  @Prop({ type: Date, nullable: true })
  updatedAt: Date | null;

  @ApiProperty({
    description: 'Membership status',
  })
  @Prop({ type: Boolean, required: true, default: false })
  isMembership: boolean;

  static createInstance(dto: CreateBlogRequestDto): BlogDocument {
    const blog = new this();
    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    blog.createdAt = new Date();
    blog.updatedAt = null;
    return blog as BlogDocument;
  }

  updateBlog(dto: CreateBlogRequestDto): void {
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
    this.updatedAt = new Date();
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

// регистрирует методы сущности в схеме
BlogSchema.loadClass(Blog);

// типизация документа
export type BlogDocument = HydratedDocument<Blog>;

// типизация модели + статические методы
export type BlogModelType = Model<BlogDocument> & typeof Blog;
