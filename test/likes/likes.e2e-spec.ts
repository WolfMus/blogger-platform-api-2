import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { AppModule } from '../../src/app.module';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';

describe('Likes', () => {
  let app: INestApplication<App>;
  let connection: Connection;

  beforeAll(async () => {
    const testingModuleBuilder = Test.createTestingModule({
      imports: [AppModule],
    });
    const moduleFixture: TestingModule = await testingModuleBuilder.compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // получаем подключение к базе данных
    connection = moduleFixture.get<Connection>(getConnectionToken());

    // очистка всех коллекций в тестовой базе данных
    // надо тут поменять
    if (connection.db) {
      const collections = await connection.db?.listCollections().toArray();
      for (const collection of collections) {
        await connection.db?.collection(collection.name).deleteMany({});
      }
    }
  });
  afterAll(async () => {
    await app.close();
  });
});
