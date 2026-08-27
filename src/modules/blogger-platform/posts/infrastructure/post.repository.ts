/* eslint-disable quotes */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '../domain/post.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PostRepository {
  constructor(
    @InjectRepository(Post)
    private postRepo: Repository<Post>,
  ) {}

  async findById(id: string): Promise<Post | null> {
    const post = await this.postRepo.findOne({
      where: { id: id },
      relations: { blog: true },
    });
    if (!post) return null;
    return post;
  }

  async findByPostIdAndBlogId(
    postId: string,
    blogId: string,
  ): Promise<Post | null> {
    const post = await this.postRepo.findOne({
      where: {
        id: postId,
        blog: { id: blogId },
      },
      relations: { blog: true },
    });
    if (!post) return null;
    return post;
  }

  async save(post: Post): Promise<Post | null> {
    const saved = await this.postRepo.save(post);
    return saved;
  }

  async deleteById(id: string): Promise<void | null> {
    const deleted = await this.postRepo.delete({ id: id });
    if (!deleted) return null;
    return;
  }

  async deleteByPostIdAndBlogId(
    postId: string,
    blogId: string,
  ): Promise<void | null> {
    const deleted = await this.postRepo.delete({
      id: postId,
      blog: { id: blogId },
    });
    if (deleted.affected === 0) return null;
    return;
  }

  async changeCounts(
    deltaLike: number,
    deltaDislike: number,
    id: string,
  ): Promise<boolean> {
    const result = await this.postRepo
      .createQueryBuilder()
      .update()
      .set({
        likesCount: () => `"likesCount" + :deltaLike`,
        dislikesCount: () => `"dislikesCount" + :deltaDislike`,
      })
      .where(`id = :id`)
      .setParameters({
        id,
        deltaLike,
        deltaDislike,
      })
      .execute();
    return result.affected === 1;
  }
}
