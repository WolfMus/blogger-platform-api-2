import { HttpStatus, INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { App } from 'supertest/types';
import { AppModule } from '../../../src/app.module';
import request from 'supertest';
import { QuestionViewModel } from '../../../src/modules/quiz-game/dto/question-view-model';

describe('Quiz', () => {
  let app: INestApplication<App>;
  let connection: Connection;
  let createdQuestionId: number;

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

    const createdQuestion = await request(app.getHttpServer())
      .post('/sa/quiz/questions')
      .auth('admin', 'qwerty')
      .send({
        body: 'What is 2 + 2?',
        correctAnswers: ['1', '2', '4'],
      });
    createdQuestionId = (createdQuestion.body as QuestionViewModel).id;
  });
  afterAll(async () => {
    await app.close();
  });

  it('sa/quiz/questions/:id (PUT) should update question by id', async () => {
    const dto = {
      body: 'What is 3 + 3?',
      correctAnswers: ['1', '2', '3'],
    };
    await request(app.getHttpServer())
      .put(`/sa/quiz/questions/${createdQuestionId}`)
      .auth('admin', 'qwerty')
      .send(dto)
      .expect(HttpStatus.NO_CONTENT);
  });
});
