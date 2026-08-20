import { Injectable } from '@nestjs/common';
import { Session } from '../../domain/sessions/session.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';

@Injectable()
export class SessionRepository {
  constructor(
    @InjectDataSource()
    private dataSoruce: DataSource,
    @InjectRepository(Session)
    private sessionRepo: Repository<Session>,
  ) {}

  async save(session: Session): Promise<Session | null> {
    const saved = await this.sessionRepo.save(session);
    return saved;
  }

  async isExistByRefreshToken(refreshToken: string): Promise<boolean> {
    const session = await this.sessionRepo.findOne({ where: { refreshToken } });
    if (!session) return false;
    return true;
  }

  async findAllByUserId(userId: string): Promise<Session[] | null> {
    const sessions = await this.sessionRepo.find({
      where: { user: { id: userId } },
      relations: {
        user: true,
      },
    });
    return sessions;
  }

  async findByuserIdAndRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<Session | null> {
    const session = await this.sessionRepo.findOne({
      where: { user: { id: userId }, refreshToken },
      relations: {
        user: true,
      },
    });
    if (!session) return null;
    return session;
  }

  async findByDeviceIdAndUserId(
    deviceId: string,
    userId: string,
  ): Promise<Session | null> {
    const session = await this.sessionRepo.findOne({
      where: { user: { id: userId }, deviceId },
      relations: {
        user: true,
      },
    });
    if (!session) return null;
    return session;
  }

  async findByDeviceId(deviceId: string): Promise<Session | null> {
    const session = await this.sessionRepo.findOne({
      where: { deviceId },
      relations: {
        user: true,
      },
    });
    if (!session) return null;
    return session;
  }

  async delete(sessionId: string): Promise<boolean> {
    const result = await this.sessionRepo.delete({ id: sessionId });
    return result.affected === 1;
  }

  async deleteSessionsByIds(sessionsIds: string[]): Promise<boolean> {
    const result = await this.sessionRepo.delete({ id: In(sessionsIds) });
    return result.affected === sessionsIds.length - 1;
  }
}
