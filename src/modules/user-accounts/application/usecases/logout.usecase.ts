import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionRepository } from '../../infrastructure/sessions/session.repository';
import {
  DomainException,
  Extension,
} from '../../../../core/exceptions/domain-exception';
import { HttpStatus } from '@nestjs/common';

export class LogoutCommand {
  constructor(
    public readonly userId: string,
    public readonly refreshToken: string,
  ) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand> {
  constructor(private sessionRepo: SessionRepository) {}

  async execute(command: LogoutCommand): Promise<void> {
    const { userId, refreshToken } = command;
    // Находим сессию по userId и refreshToken
    const session = await this.sessionRepo.findByuserIdAndRefreshToken(
      userId,
      refreshToken,
    );
    if (!session) {
      throw new DomainException({
        code: HttpStatus.BAD_REQUEST,
        message: 'Bad Request',
        extensions: [new Extension('Session not found', 'refreshToken')],
      });
    }
    // Удаляем сессию из бд
    await this.sessionRepo.delete(session._id.toString());
  }
}

/**
 * Найти в бд сессию по userId и refreshToken
 * Удалить сессию из бд
 * Вернуть статус 204 No Content
 */
