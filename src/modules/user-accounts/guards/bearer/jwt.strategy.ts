import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { SessionRepository } from '../../infrastructure/sessions/session.repository';

interface JwtPayload {
  sub: string;
  login: string;
  tokenVersion: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private sessionRepo: SessionRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'access-token-secret',
    });
  }

  validate(payload: JwtPayload): { userId: string; login: string } {
    return { userId: payload.sub, login: payload.login };
  }
}
