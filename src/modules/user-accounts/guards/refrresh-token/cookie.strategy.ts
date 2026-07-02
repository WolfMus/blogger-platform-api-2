import { HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { SessionRepository } from '../../infrastructure/sessions/session.repository';
import { DomainException } from '../../../../core/exceptions/domain-exception';
interface JwtPayload {
  sub: string;
  login: string;
}
@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private sessionRepo: SessionRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const token = req.cookies['refreshToken'] as string;
          return token;
        },
      ]),
      secretOrKey: 'refresh-token-secret',
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    payload: JwtPayload,
  ): Promise<{ userId: string; login: string }> {
    const refreshToken = req.cookies['refreshToken'] as string;
    const rT = await this.sessionRepo.isRefreshTokenExists(refreshToken);
    if (!rT) {
      throw new DomainException({
        code: HttpStatus.UNAUTHORIZED,
        message: 'Not Found',
      });
    }
    return { userId: payload.sub, login: payload.login };
  }
}
