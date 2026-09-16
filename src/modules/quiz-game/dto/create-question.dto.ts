import { ArrayNotEmpty, ArrayUnique, IsString, Length } from 'class-validator';
import { Trim } from '../../../core/decorators/transform/trim';

export class CreateQuestionDto {
  @Length(10, 500)
  @IsString()
  @Trim()
  body: string;

  @ArrayNotEmpty()
  @ArrayUnique()
  @Trim()
  correctAnswers: string[];
}
