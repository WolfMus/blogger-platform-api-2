import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { BlogDocument } from '../domain/blog.entity';

@ApiSchema({ name: 'BlogResponseDto' })
export class BlogResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  websiteUrl: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  isMembership: boolean;

  static mapToView(blog: BlogDocument): BlogResponseDto {
    const dto = new BlogResponseDto();
    dto.id = blog._id.toString();
    dto.name = blog.name;
    dto.description = blog.description;
    dto.websiteUrl = blog.websiteUrl;
    dto.createdAt = blog.createdAt;
    dto.isMembership = blog.isMembership;
    return dto;
  }
}
