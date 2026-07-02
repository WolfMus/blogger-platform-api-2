import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtRefreshGuard } from '../guards/refrresh-token/refresh-token.guard';
import { SessionService } from '../application/session.service';

@Controller('security/devices')
export class SessionsController {
  constructor(private sessionService: SessionService) {}

  // ВСЕ СЕССИИ ПОЛЬЗОВАТЕЛЯ
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @Get()
  async getActiveSessions(@Req() req: Request) {
    const userInfo = req.user as { userId: string; login: string };
    return await this.sessionService.getActiveSessions(userInfo.userId);
  }

  // УДАЛИТЬ СЕССИЮ ПО ID
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtRefreshGuard)
  @Delete('/:deviceId')
  async terminateSessionByDeviceId(
    @Req() req: Request,
    @Param('deviceId') deviceId: string,
  ) {
    const userInfo = req.user as { userId: string; login: string };
    return await this.sessionService.terminateSessionByDeviceId(
      deviceId,
      userInfo.userId,
    );
  }

  // УДАЛИТЬ ВСЕ СЕССИИ ПОЛЬЗОВАТЕЛЯ
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtRefreshGuard)
  @Delete()
  async terminateAllSessions(@Req() req: Request) {
    const userInfo = req.user as { userId: string; login: string };
    const refreshToken = req.cookies['refreshToken'] as string;
    return await this.sessionService.terminateAllSessions(
      userInfo.userId,
      refreshToken,
    );
  }
}
