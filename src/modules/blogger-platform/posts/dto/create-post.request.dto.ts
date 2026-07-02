import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';

export class CreatePostForBlogRequestDto {
  @ApiProperty({})
  @IsString()
  @Length(3, 30)
  @Trim()
  title: string;

  @ApiProperty({})
  @Length(1, 100)
  @Trim()
  shortDescription: string;

  @ApiProperty({})
  @Length(1, 1000)
  @Trim()
  content: string;
}

export class CreatePostRequestDto {
  @ApiProperty({})
  @IsString()
  @Length(3, 30)
  @Trim()
  title: string;

  @ApiProperty({})
  @Length(1, 100)
  @Trim()
  shortDescription: string;

  @ApiProperty({})
  @Length(1, 1000)
  @Trim()
  content: string;

  @ApiProperty({})
  @IsString()
  @Trim()
  blogId: string;
}
