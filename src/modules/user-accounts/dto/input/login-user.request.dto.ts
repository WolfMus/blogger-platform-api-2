import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginUserRequestDto {
  @ApiProperty()
  @IsString()
  loginOrEmail: string;

  @ApiProperty()
  @IsString()
  password: string;
}
