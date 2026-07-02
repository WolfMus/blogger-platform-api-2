import { SessionDocument } from '../../domain/sessions/session.entity';
import { SessionResponseDto } from '../session.response.dto';

export class SessionMapper {
  toResponseView(sessions: SessionDocument[]): SessionResponseDto[] {
    if (sessions === null || sessions.length === 0) {
      return [];
    }
    const sessionsMapped = sessions.map((session) => {
      return {
        ip: session.ip,
        title: session.title,
        lastActiveDate: session.lastActiveDate,
        deviceId: session.deviceId,
      };
    });
    return sessionsMapped;
  }
}
