import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  login: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  createdAt: Date;
}
