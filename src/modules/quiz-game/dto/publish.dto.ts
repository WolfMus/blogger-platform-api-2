import { IsBoolean } from 'class-validator';

export class PublishQuestionDto {
  @IsBoolean()
  publish: boolean;
}
