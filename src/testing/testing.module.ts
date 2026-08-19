import { TestingController } from './api/testing.controller';
import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from '../modules/user-accounts/domain/sessions/session.entity';
import { User } from '../modules/user-accounts/domain/users/postgresql/user.postgres.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Session])],
  controllers: [TestingController],
})
export class TestingModule {}
