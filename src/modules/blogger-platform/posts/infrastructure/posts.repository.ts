import { Injectable } from '@nestjs/common';
import { Post, PostDocument } from '../domain/post.entity';
import type { PostModelType } from '../domain/post.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
  ) {}

  async findById(id: string): Promise<PostDocument | null> {
    const post = await this.PostModel.findById(id);
    if (!post) return null;
    return post;
  }

  async save(post: PostDocument): Promise<void> {
    await post.save();
    return;
  }

  async delete(id: string): Promise<PostDocument | null> {
    const deletedPost = await this.PostModel.findByIdAndDelete(id);
    if (!deletedPost) return null;
    return deletedPost;
  }

  async changeCounts(
    deltaLike: number,
    deltaDislike: number,
    id: string,
  ): Promise<void> {
    console.log(deltaLike, deltaDislike);
    await this.PostModel.findOneAndUpdate(
      { _id: id },
      {
        $inc: {
          'extendedLikesInfo.likesCount': deltaLike,
          'extendedLikesInfo.dislikesCount': deltaDislike,
        },
      },
    );
    return;
  }
}
