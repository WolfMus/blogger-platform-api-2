import { ApiProperty } from '@nestjs/swagger';
import { Trim } from '../../../../core/decorators/transform/trim';
import { IsString, Length } from 'class-validator';

export class CreateCommentEntityDto {
  @ApiProperty()
  @IsString()
  @Length(20, 300)
  @Trim()
  content: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  userLogin: string;
}
