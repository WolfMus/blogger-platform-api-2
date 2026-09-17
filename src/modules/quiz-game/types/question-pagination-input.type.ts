import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationInput } from '../../../core/dto/pagination.request.dto';

export enum PublishedStatus {
  All = 'all',
  Published = 'published',
  NotPublished = 'notPublished',
}

export class QuestionPaginationInput extends PaginationInput {
  @IsOptional()
  @IsString()
  bodySearchTerm: string | null = null;

  @IsOptional()
  @IsEnum(PublishedStatus)
  publishedStatus: PublishedStatus = PublishedStatus.All;
}
