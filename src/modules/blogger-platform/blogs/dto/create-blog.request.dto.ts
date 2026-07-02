import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';

const urlRegExp =
  '^https://([a-zA-Z0-9_-]+.)+[a-zA-Z0-9_-]+(/[a-zA-Z0-9_-]+)*/?$';

@ApiSchema({
  name: 'CreateBlogRequestDto',
})
export class CreateBlogRequestDto {
  @ApiProperty({})
  @Length(1, 15)
  @IsString()
  @Trim()
  name: string;

  @ApiProperty({})
  @Length(1, 500)
  @Trim()
  description: string;

  @ApiProperty({})
  @Matches(urlRegExp)
  @Length(5, 100)
  @Trim()
  websiteUrl: string;
}
