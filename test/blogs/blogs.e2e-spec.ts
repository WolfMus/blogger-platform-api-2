import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import request from 'supertest';
import { BlogResponseDto } from '../../src/modules/blogger-platform/blogs/dto/blog-response.dto';

describe('BlogsController (e2e)', () => {
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

  it('/blogs (POST) should create new blog', async () => {
    const response = await request(app.getHttpServer()).post('/blogs').send({
      name: 'newBlog',
      description: 'description',
      websiteUrl: 'https://arbuzini.com',
    });
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body).toHaveProperty('id');
  });

  it('/blogs (GET) should return all blogs', async () => {
    const response = await request(app.getHttpServer()).get('/blogs');
    expect(response.status).toBe(200);
  });

  it('/blogs/:id (GET) should return blog by id', async () => {
    const blogPostResponse = await request(app.getHttpServer())
      .post('/blogs')
      .send({
        name: 'newBlog',
        description: 'description',
        websiteUrl: 'https://arbuzini.com',
      })
      .expect(HttpStatus.CREATED);

    const blogBody = blogPostResponse.body as BlogResponseDto;
    const response = await request(app.getHttpServer()).get(
      `/blogs/${blogBody.id}`,
    );
    expect(response.status).toBe(HttpStatus.OK);
    expect((response.body as BlogResponseDto).id).toBe(blogBody.id);
  });

  it('/blogs/:id (DELETE) should delete blog by id', async () => {
    const blogPostResponse = await request(app.getHttpServer())
      .post('/blogs')
      .send({
        name: 'newBlog',
        description: 'description',
        websiteUrl: 'https://arbuzini.com',
      })
      .expect(HttpStatus.CREATED);
    const blogBody = blogPostResponse.body as BlogResponseDto;
    const response = await request(app.getHttpServer()).delete(
      `/blogs/${blogBody.id}`,
    );
    expect(response.status).toBe(HttpStatus.NO_CONTENT);
    await request(app.getHttpServer())
      .get(`/blogs/${blogBody.id}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('/blogs/:id (PUT) should update blog by id', async () => {
    const blogPostResponse = await request(app.getHttpServer())
      .post('/blogs')
      .send({
        name: 'newBlog',
        description: 'description',
        websiteUrl: 'https://arbuzini.com',
      })
      .expect(HttpStatus.CREATED);
    const blogBody = blogPostResponse.body as BlogResponseDto;
    const dtoForUpdate = {
      name: 'updatedName',
      description: 'updatedDescription',
      websiteUrl: 'https://updated-url.com',
    };

    await request(app.getHttpServer())
      .put(`/blogs/${blogBody.id}`)
      .send(dtoForUpdate)
      .expect(HttpStatus.NO_CONTENT);

    const response = await request(app.getHttpServer()).get(
      `/blogs/${blogBody.id}`,
    );
    expect((response.body as BlogResponseDto).name).toBe(dtoForUpdate.name);
  });
});
