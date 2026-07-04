import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { SessionRepository } from '../../../infrastructure/sessions/session.repository';
import { JwtPayload } from '../../../../../core/types/payload.interface';
import {
  DomainException,
  Extension,
} from '../../../../../core/exceptions/domain-exception';
import { HttpStatus } from '@nestjs/common';

export class RefreshTokenCommand {
  constructor(
    public readonly userInfo: {
      userId: string;
      login: string;
      tokenVersion: number;
    },
    public readonly oldRefreshToken: string,
  ) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase implements ICommandHandler<RefreshTokenCommand> {
  constructor(
    private jwtService: JwtService,
    private sessionRepo: SessionRepository,
  ) {}

  async execute(
    command: RefreshTokenCommand,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { userId, login } = command.userInfo;
    const oldRefreshToken = command.oldRefreshToken;
    // Находим сессию по userId и oldRefreshToken
    const session = await this.sessionRepo.findByuserIdAndRefreshToken(
      userId,
      oldRefreshToken,
    );
    if (!session) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [
          new Extension('Session Not Found', 'userId and refreshToken'),
        ],
      });
    }

    // Создаем новый accessToken и refreshToken
    const payload: JwtPayload = {
      sub: userId,
      login: login,
    };
    const refreshToken = await this.jwtService.signAsync(
      {
        ...payload,
        deviceId: session.deviceId,
      },
      {
        expiresIn: '20s',
        secret: 'refresh-token-secret',
      },
    );
    const accessToken = await this.jwtService.signAsync(
      {
        ...payload,
        tokenVersion: session.tokenVersion + 1,
      },
      {
        expiresIn: '10s',
        secret: 'access-token-secret',
      },
    );
    console.log(session);
    session.updateRefreshToken(refreshToken);
    await this.sessionRepo.save(session);
    return { accessToken, refreshToken };
  }
}
