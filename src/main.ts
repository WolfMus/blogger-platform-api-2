import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
// import { HttpExceptionFilter } from './core/exceptions/http-exception.filter';
// import { DomainException } from './core/exceptions/domain-exception';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['debug', 'log', 'warn', 'error'],
  });

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const errorsForResponse: Array<{ field: string; message: string }> = [];
        errors.forEach((e) => {
          const zeroKey = Object.keys(e.constraints!)[0];
          errorsForResponse.push({
            field: e.property,
            message: e.constraints![zeroKey],
          });
        });
        throw new BadRequestException(errorsForResponse);
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Blogger Platform')
    .setDescription('Documentation for blogger platform API')
    .setVersion('0.0.1')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
