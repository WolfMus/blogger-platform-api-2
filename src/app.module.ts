import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BloggerPlatformModule } from './modules/blogger-platform/blogger-platform.module';
import { TestingModule } from './testing/testing.module';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './core/exceptions/filters/http-exception.filter';
import { DomainExceptionFilter } from './core/exceptions/filters/domain-exception.filter';
import { CqrsModule } from '@nestjs/cqrs';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPostgres } from './modules/user-accounts/domain/users/postgresql/user.postgres.entity';
import { Session } from './modules/user-accounts/domain/sessions/session.entity';
import { BlogsPostgres } from './modules/blogger-platform/blogs/domain/blog-postgres.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'severe',
      database: 'BloggerPlatformAPII',
      entities: [UserPostgres, Session, BlogsPostgres],
      synchronize: true,
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule.forRoot(),
    MongooseModule.forRoot(
      process.env.MONGODB_URI ||
        'mongodb://MrSevere:qwertyadmin@ac-4suh2hg-shard-00-00.rtpcxjn.mongodb.net:27017,ac-4suh2hg-shard-00-01.rtpcxjn.mongodb.net:27017,ac-4suh2hg-shard-00-02.rtpcxjn.mongodb.net:27017/bloger-platform?ssl=true&replicaSet=atlas-sa4lbn-shard-0&authSource=admin&appName=Cluster0',
    ),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 10000,
          limit: 5,
        },
      ],
    }),
    BloggerPlatformModule,
    TestingModule,
    UserAccountsModule,
    NotificationsModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
