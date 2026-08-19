import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiNoContentResponse } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}
  @ApiNoContentResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/all-data')
  async deleteAllData(): Promise<void> {
    console.log('‼️ALL CONTENT DELETED‼️');
    await this.dataSource.query(
      'TRUNCATE users, session, blogs, posts, likes, comments;',
    );

    return;
  }
}
