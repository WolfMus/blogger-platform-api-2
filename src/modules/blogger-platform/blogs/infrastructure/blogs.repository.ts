import { HttpStatus, Injectable } from '@nestjs/common';
import { Blog, BlogDocument } from '../domain/blog.entity';
import type { BlogModelType } from '../domain/blog.entity';
import { InjectModel } from '@nestjs/mongoose';
import {
  DomainException,
  Extension,
} from '../../../../core/exceptions/domain-exception';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
  ) {}

  async findById(id: string): Promise<BlogDocument | null> {
    const blog = await this.BlogModel.findById(id);
    if (!blog) return null;
    return blog;
  }

  async save(blog: BlogDocument): Promise<void> {
    await blog.save();
    return;
  }

  async delete(id: number): Promise<void> {
    const deletedBlog = await this.BlogModel.findByIdAndDelete(id);
    if (deletedBlog === null) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Blog Not Found', 'id')],
      });
    }
    return;
  }
}
