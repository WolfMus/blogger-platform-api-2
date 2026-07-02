import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponseDto } from '../dto/error-response.dto';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name, {
    timestamp: true,
  });

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    if (exception.message.includes('Invalid ObjectId')) {
      const errorResponse: ErrorResponseDto = {
        errorsMessages: [],
      };
      errorResponse.errorsMessages.push({
        message: 'Invalid Id',
        field: Object.keys(request.params)[0],
      });
      response.status(status).json(errorResponse);
      return;
    }

    if (status === 400) {
      const errorResponse: ErrorResponseDto = {
        errorsMessages: [],
      };
      const responseBody = exception.getResponse() as {
        message: Array<{ field: string; message: string }>;
        error?: string;
        statusCode?: number;
      };
      console.log(responseBody);

      if (Array.isArray(responseBody.message)) {
        responseBody.message.forEach((m) =>
          errorResponse.errorsMessages.push({
            field: m.field,
            message: m.message,
          }),
        );
      } else if (typeof responseBody.message === 'string') {
        errorResponse.errorsMessages.push({
          field: responseBody.message,
          message: 'm.message',
        });
      }
      response.status(status).json(errorResponse);
      return;
    }

    if (status === 401) {
      this.logger.error(exception.message);
      return response.sendStatus(status);
    }

    if (status === 403) {
      return response.sendStatus(status);
    }

    if (status === 429) {
      return response.sendStatus(status);
    }

    return response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
