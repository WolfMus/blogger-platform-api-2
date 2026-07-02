import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDomainDto {
  @ApiProperty()
  login: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  passwordHash: string;
}
