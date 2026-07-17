import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'PostResponseDto' })
export class PostViewDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  shortDescription: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  blogId: string;

  @ApiProperty()
  blogName: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  likesCount: number;

  @ApiProperty()
  dislikesCount: number;
}
