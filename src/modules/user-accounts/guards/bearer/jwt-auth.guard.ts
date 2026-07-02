import { HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DomainException } from '../../../../core/exceptions/domain-exception';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any): any {
    console.log('err || !user ', err || !user);
    if (err || !user) {
      throw new DomainException({
        code: HttpStatus.UNAUTHORIZED,
        message: 'Unauthorized',
      });
    }
    return user;
  }
}
