import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { SessionRepository } from '../../../infrastructure/sessions/session.repository';
import { JwtPayload } from '../../../../../core/types/payload.interface';

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
      throw new Error('Session not found <RefreshTokenUseCase>');
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
    session.updateRefreshToken(refreshToken);
    await this.sessionRepo.save(session);
    return { accessToken, refreshToken };
  }
}

/**
 * Найти в бд сессию по userId и oldRefreshToken
 * Создать новый accessToken и refreshToken
 * Обновить сессию в бд новым refreshToken и lastActiveDate
 * Вернуть новый accessToken и refreshToken
 */
