import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CreateUserRequestDto } from '../dto/input/create-user.request.dto';
import { UserService } from '../application/user.service';
import { NewPasswordDto } from '../dto/input/new-password.dto';
import { LoginUserRequestDto } from '../dto/input/login-user.request.dto';
import type { Request, Response } from 'express';
import { CommandBus } from '@nestjs/cqrs';
import { LoginUserCommand } from '../application/usecases/login.usecase';
import { RegistrationUserCommand } from '../application/usecases/registration.usecase';
import { ConfirmRegistrationCommand } from '../application/usecases/confirm-registration.usecase';
import { ResendConfirmationCodeCommand } from '../application/usecases/resend-confirmation-code.usecase';
import { SendRecoveryCodeCommand } from '../application/usecases/send-recovery-code.usecase';
import { ResetPasswordCommand } from '../application/usecases/reset-password.usecase';
import { LocalAuthGuard } from '../guards/local/local-auth.guard';
import { JwtAuthGuard } from '../guards/bearer/jwt-auth.guard';
import { JwtRefreshGuard } from '../guards/refrresh-token/refresh-token.guard';
import { RefreshTokenCommand } from '../application/usecases/session/refresh-token.usecase';
import { LogoutCommand } from '../application/usecases/logout.usecase';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(
    private userService: UserService,
    private commandBus: CommandBus,
  ) {}

  // ✅ LOGIN
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard, LocalAuthGuard)
  @Post('/login')
  async loginUser(
    @Body() dto: LoginUserRequestDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const ip = req.ip || null;
    const deviceName = req.headers['user-agent'] || null;
    const deviceInfo = {
      ip: ip,
      title: deviceName,
    };

    const { accessToken, refreshToken } = await this.commandBus.execute<
      LoginUserCommand,
      { accessToken: string; refreshToken: string }
    >(new LoginUserCommand(dto, deviceInfo));
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return { accessToken };
  }

  // ✅ LOGOUT
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtRefreshGuard)
  @Post('/logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const userInfo = req.user as { userId: string; login: string };
    const refreshToken = req.cookies['refreshToken'] as string;
    await this.commandBus.execute<LogoutCommand, void>(
      new LogoutCommand(userInfo.userId, refreshToken),
    );
    res.clearCookie('refreshToken');
    return;
  }

  // ✅ NEW REFRESH TOKEN
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @Post('/refresh-token')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const userInfo = req.user as {
      userId: string;
      login: string;
      tokenVersion: number;
    };
    const oldRefreshToken = req.cookies['refreshToken'] as string;
    const { accessToken, refreshToken } = await this.commandBus.execute<
      RefreshTokenCommand,
      { accessToken: string; refreshToken: string }
    >(new RefreshTokenCommand(userInfo, oldRefreshToken));
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return { accessToken };
  }

  // ✅ REGISTRATION
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(ThrottlerGuard)
  @Post('/registration')
  async registration(@Body() dto: CreateUserRequestDto): Promise<void> {
    console.log(dto);
    return await this.commandBus.execute<RegistrationUserCommand, void>(
      new RegistrationUserCommand(dto),
    );
  }

  // ✅ REGISTRATION-CONFIRMATION
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(ThrottlerGuard)
  @Post('/registration-confirmation')
  async confirmRegistration(@Body('code') code: string): Promise<void> {
    return await this.commandBus.execute<ConfirmRegistrationCommand, void>(
      new ConfirmRegistrationCommand(code),
    );
  }

  // ✅ REGISTRATION EMAIL RESENDING
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(ThrottlerGuard)
  @Post('/registration-email-resending')
  async resendConfirmationCode(@Body('email') email: string): Promise<void> {
    return await this.commandBus.execute<ResendConfirmationCodeCommand, void>(
      new ResendConfirmationCodeCommand(email),
    );
  }

  // ✅ RECOVERY CODE PASSWORD
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(ThrottlerGuard)
  @Post('/password-recovery')
  async passwordRecovery(@Body('email') email: string): Promise<void> {
    return await this.commandBus.execute<SendRecoveryCodeCommand, void>(
      new SendRecoveryCodeCommand(email),
    );
  }

  // ✅ NEW PASSWORD
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(ThrottlerGuard)
  @Post('/new-password')
  async newPassword(@Body() dto: NewPasswordDto): Promise<void> {
    return await this.commandBus.execute<ResetPasswordCommand, void>(
      new ResetPasswordCommand(dto),
    );
  }

  // ✅ GET ME
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async getMeInfo(@Req() req: Request): Promise<{
    email: string;
    login: string;
    userId: string;
  }> {
    const userInfo = req.user as { userId: string; login: string };
    return await this.userService.getMeInfo(userInfo.userId);
  }
}
