import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from '../domain/blog.entity';

@Injectable()
export class BlogRepository {
  constructor(
    @InjectRepository(Blog)
    private blogRepo: Repository<Blog>,
  ) {}

  async findById(id: string): Promise<Blog | null> {
    const blog = await this.blogRepo.findOne({ where: { id } });
    if (!blog) return null;
    return blog;
  }

  async save(blog: Blog): Promise<Blog | null> {
    const saved = await this.blogRepo.save(blog);
    return saved;
  }

  async delete(id: string): Promise<void | null> {
    const deleted = await this.blogRepo.delete({ id: id });
    if (!deleted) {
      return null;
    }
    return;
  }
}
