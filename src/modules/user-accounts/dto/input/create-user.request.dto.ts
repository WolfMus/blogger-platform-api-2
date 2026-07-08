import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';

const loginRegExp = '^[a-zA-Z0-9_-]*$';
const emailRegExp = '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'; // перед \ добавил ещё один \

export class CreateUserRequestDto {
  @ApiProperty()
  @IsString()
  @Length(3, 10)
  @Matches(loginRegExp)
  @Trim()
  login: string;

  @ApiProperty()
  @IsString()
  @Length(6, 20)
  @Trim()
  password: string;

  @ApiProperty()
  @Matches(emailRegExp)
  @Trim()
  email: string;
}
