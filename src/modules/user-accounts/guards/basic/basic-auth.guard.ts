import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import {
  DomainException,
  Extension,
} from '../../../../core/exceptions/domain-exception';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const ctx = context.switchToHttp();
    const request: Request = ctx.getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new DomainException({
        code: HttpStatus.UNAUTHORIZED,
        message: 'Unauthorized',
        extensions: [new Extension('Unauthorized', 'Auth')],
      });
    }

    const [authType, token] = authHeader.split(' ');

    // Auth type = BASIC
    if (authType === 'Basic') {
      const [username, password] = Buffer.from(token, 'base64')
        .toString('utf8')
        .split(':');

      if (username !== 'admin' || password !== 'qwerty') {
        throw new DomainException({
          code: HttpStatus.UNAUTHORIZED,
          message: 'Unauthorized',
          extensions: [new Extension('Unauthorized', 'Auth')],
        });
      }

      return true;
    }
    throw new DomainException({
      code: HttpStatus.UNAUTHORIZED,
      message: 'Unauthorized',
      extensions: [new Extension('Unauthorized', 'Auth')],
    });
  }
}
