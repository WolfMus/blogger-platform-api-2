import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'severe',
  database: 'BloggerPlatformAPII',
  migrations: ['migrations/*.ts'],
  entities: ['src/**/*.entity.ts'],
});
