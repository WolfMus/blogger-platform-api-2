import { IsString, Length } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';

export class AnswerRequestDto {
  @Length(1, 20)
  @IsString()
  @Trim()
  answer: string;
}
