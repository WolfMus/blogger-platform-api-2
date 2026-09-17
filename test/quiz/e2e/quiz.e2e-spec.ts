import { HttpStatus, INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { App } from 'supertest/types';
import { AppModule } from '../../../src/app.module';
import request from 'supertest';
import { QuestionViewModel } from '../../../src/modules/quiz-game/dto/question-view-model';
import { CreateQuestionDto } from '../../../src/modules/quiz-game/dto/create-question.dto';

describe('Quiz', () => {
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

  it('sa/quiz/questions (QUESTION) should create new question', async () => {
    const dto: CreateQuestionDto = {
      body: 'What is 2 + 2?',
      correctAnswers: ['4'],
    };

    const response = await request(app.getHttpServer())
      .post('/sa/quiz/questions')
      .auth('admin', 'qwerty')
      .send(dto)
      .expect(HttpStatus.CREATED);

    expect(response.body).toEqual({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      body: 'What is 2 + 2?',
      correctAnswers: ['4'],
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      publish: expect.any(Boolean),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      createdAt: expect.any(String),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      updatedAt: expect.any(String),
    });
  });
});
