import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainException } from '../domain-exception';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name, {
    timestamp: true,
  });
  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.code;

    if (status === HttpStatus.UNAUTHORIZED) {
      this.logger.error(exception.message);
      return response.sendStatus(status);
    }

    if (status === HttpStatus.FORBIDDEN) {
      this.logger.error(exception.message);
      return response.sendStatus(status);
    }

    this.logger.error(exception.message);
    return response.status(status).json({
      errorsMessages: [
        {
          message: exception.extensions[0].message,
          field: exception.extensions[0].field,
        },
      ],
    });
  }
}
