import { HttpStatus, Injectable } from '@nestjs/common';
import { SessionRepository } from '../infrastructure/sessions/session.repository';
import { SessionMapper } from '../dto/mapper/session.mapper';
import {
  DomainException,
  Extension,
} from '../../../core/exceptions/domain-exception';

@Injectable()
export class SessionService {
  constructor(
    private sessionRepo: SessionRepository,
    private sessionMapper: SessionMapper,
  ) {}

  async getActiveSessions(userId: string) {
    const sessions = await this.sessionRepo.findAllByUserId(userId);
    if (sessions === null) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: `No active sessions found for user with ID ${userId}`,
        extensions: [new Extension('Sessions not found', userId)],
      });
    }
    return this.sessionMapper.toResponseView(sessions);
  }

  async terminateSessionByDeviceId(deviceId: string, userId: string) {
    const session = await this.sessionRepo.findByDeviceId(deviceId);
    if (!session) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: `Session with device ID ${deviceId} not found for user with ID ${userId}`,
        extensions: [new Extension('Session not found', deviceId)],
      });
    }
    if (session.userId.toString() !== userId) {
      throw new DomainException({
        code: HttpStatus.FORBIDDEN,
        message: `User with ID ${userId} does not have permission to delete session with device ID ${deviceId}`,
        extensions: [new Extension('Forbidden', 'userId')],
      });
    }
    return await this.sessionRepo.delete(session.id);
  }

  async terminateAllSessions(userId: string, refreshToken: string) {
    const sessionCurrent = await this.sessionRepo.findByuserIdAndRefreshToken(
      userId,
      refreshToken,
    );
    console.log('current session id: ', sessionCurrent!.id.toString());
    if (!sessionCurrent) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: `Session with refresh token ${refreshToken} not found for user with ID ${userId}`,
        extensions: [new Extension('Session not found', refreshToken)],
      });
    }
    const sessions = await this.sessionRepo.findAllByUserId(userId);
    if (sessions === null) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: `No active sessions found for user with ID ${userId}`,
        extensions: [new Extension('Sessions not found', userId)],
      });
    }
    const sessionsIds = sessions
      .filter((s) => {
        return s.id.toString() !== sessionCurrent.id.toString();
      })
      .map((s) => s.id.toString());
    await this.sessionRepo.deleteSessionsByIds(sessionsIds);
    return;
  }
}
