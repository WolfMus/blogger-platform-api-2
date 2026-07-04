import { Injectable } from '@nestjs/common';
import { Session } from '../../domain/sessions/session.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class SessionRepository {
  constructor(
    @InjectDataSource()
    private dataSoruce: DataSource,
    @InjectRepository(Session)
    private sessionRepo: Repository<Session>,
  ) {}

  private toEntity(session: Session): Session {
    return this.sessionRepo.create(session);
  }

  async save(session: Session): Promise<void> {
    await this.sessionRepo.save(session);
    return;
  }

  async isExistByRefreshToken(refreshToken: string): Promise<boolean> {
    const row: Session[] = await this.dataSoruce.query(
      `
        SELECT 
        id, 
        refresh_token as "refreshToken", 
        token_version as "tokenVersion", 
        title as "title", 
        ip as "ip", 
        last_active_date as "lastActiveDate", 
        user_id as "userId", 
        device_id as "deviceId"
          FROM session
          WHERE refresh_token = $1;
      `,
      [refreshToken],
    );
    const session = row[0];
    if (!session) return false;
    return true;
  }

  async findAllByUserId(userId: string): Promise<Session[] | null> {
    const row: Session[] = await this.dataSoruce.query(
      `
        SELECT 
        id, 
        refresh_token as "refreshToken", 
        token_version as "tokenVersion", 
        title as "title", 
        ip as "ip", 
        last_active_date as "lastActiveDate", 
        user_id as "userId", 
        device_id as "deviceId"
          FROM session
          WHERE user_id = $1;
      `,
      [userId],
    );
    console.log(row);
    const sessions = row;
    if (!sessions || sessions.length === 0) {
      return null;
    }
    return sessions;
  }

  async findByuserIdAndRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<Session | null> {
    const row: Session[] = await this.dataSoruce.query(
      `
        SELECT 
        id, 
        refresh_token as "refreshToken", 
        token_version as "tokenVersion", 
        title as "title", 
        ip as "ip", 
        last_active_date as "lastActiveDate", 
        user_id as "userId", 
        device_id as "deviceId"
          FROM session
          WHERE user_id = $1 AND refresh_token = $2;
      `,
      [userId, refreshToken],
    );
    const session = row[0];
    console.log(session);
    if (!session) return null;
    return this.toEntity(session);
  }

  async findByDeviceIdAndUserId(
    deviceId: string,
    userId: string,
  ): Promise<Session | null> {
    const row: Session[] = await this.dataSoruce.query(
      `
        SELECT 
        id, 
        refresh_token as "refreshToken", 
        token_version as "tokenVersion", 
        title as "title", 
        ip as "ip", 
        last_active_date as "lastActiveDate", 
        user_id as "userId", 
        device_id as "deviceId"
          FROM session
          WHERE device_id = $1 AND user_id = $2;
      `,
      [deviceId, userId],
    );
    const session = row[0];
    if (!session) return null;
    return this.toEntity(session);
  }

  async findByDeviceId(deviceId: string): Promise<Session | null> {
    const row: Session[] = await this.dataSoruce.query(
      `
        SELECT 
        id, 
        refresh_token as "refreshToken", 
        token_version as "tokenVersion", 
        title as "title", 
        ip as "ip", 
        last_active_date as "lastActiveDate", 
        user_id as "userId", 
        device_id as "deviceId"
          FROM session
          WHERE device_id = $1;
      `,
      [deviceId],
    );
    const session = row[0];
    if (!session) return null;
    return session;
  }

  async delete(sessionId: string): Promise<void> {
    await this.dataSoruce.query(
      `
        DELETE 
          FROM session
	        WHERE id = $1;
      `,
      [sessionId],
    );
    // if (!sessionDeleted) {
    //   throw new Error('Session not found <SessionRepository.delete>');
    // }
    return;
  }

  async deleteSessionsByIds(sessionsIds: string[]): Promise<void> {
    await this.dataSoruce.query(
      `
        DELETE 
          FROM session
	        WHERE id = ANY($1);
      `,
      [sessionsIds],
    );
    // if (!sessionsDeleted) {
    //   throw new Error('Session not found <SessionRepository.delete>');
    // }
    return;
  }
}
