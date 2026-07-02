import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class Pagination {
  @ApiProperty({})
  @Type(() => Number)
  pagesCount: number;

  @ApiProperty({})
  @Type(() => Number)
  page: number;

  @ApiProperty({})
  @Type(() => Number)
  pageSize: number;

  @ApiProperty({})
  @Type(() => Number)
  totalCount: number;
}
