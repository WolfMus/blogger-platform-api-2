import { Injectable } from '@nestjs/common';
import { Session, SessionDocument } from '../../domain/sessions/session.entity';
import type { SessionModelType } from '../../domain/sessions/session.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class SessionRepository {
  constructor(
    @InjectModel(Session.name)
    private sessionModel: SessionModelType,
  ) {}

  async save(session: SessionDocument): Promise<void> {
    await session.save();
    return;
  }

  async findAllByUserId(userId: string): Promise<SessionDocument[] | null> {
    const sessions = await this.sessionModel.find({ userId });
    if (!sessions || sessions.length === 0) {
      return null;
    }
    return sessions;
  }

  async isRefreshTokenExists(refreshToken: string): Promise<boolean> {
    const session = await this.sessionModel.findOne({ refreshToken });
    if (!session) return false;
    return true;
  }

  async findByuserIdAndRefreshToken(
    userId: string,
    oldRefreshToken: string,
  ): Promise<SessionDocument | null> {
    const session = await this.sessionModel.findOne({
      userId: userId,
      refreshToken: oldRefreshToken,
    });
    if (!session) {
      return null;
    }
    return session;
  }

  async delete(sessionId: string): Promise<void> {
    const sessionDeleted = await this.sessionModel.findByIdAndDelete(sessionId);
    if (!sessionDeleted) {
      throw new Error('Session not found <SessionRepository.delete>');
    }
    return;
  }

  async deleteSessionsByIds(sessionsIds: string[]): Promise<void> {
    const sessionsDeleted = await this.sessionModel.deleteMany({
      _id: { $in: sessionsIds },
    });
    if (!sessionsDeleted) {
      throw new Error('Session not found <SessionRepository.delete>');
    }
    return;
  }

  async findByDeviceIdAndUserId(
    deviceId: string,
    userId: string,
  ): Promise<SessionDocument | null> {
    const session = await this.sessionModel.findOne({
      deviceId: deviceId,
      userId: userId,
    });
    if (!session) return null;
    return session;
  }

  async findByDeviceId(deviceId: string): Promise<SessionDocument | null> {
    const session = await this.sessionModel.findOne({
      deviceId: deviceId,
    });
    if (!session) return null;
    return session;
  }
}
