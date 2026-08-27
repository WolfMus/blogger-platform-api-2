import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginUserRequestDto } from '../../dto/input/login-user.request.dto';
import { HttpStatus } from '@nestjs/common';
import {
  DomainException,
  Extension,
} from '../../../../core/exceptions/domain-exception';
import { CreateSessionDto } from '../../domain/sessions/dto/create-session.domain.dto';
import { JwtService } from '@nestjs/jwt';
import { Session } from '../../domain/sessions/session.entity';
import { SessionRepository } from '../../infrastructure/sessions/session.repository';
import { CryptoService } from '../crypto.service';
import { UserRepository } from '../../infrastructure/users/user.repository';

export class LoginUserCommand {
  constructor(
    public dto: LoginUserRequestDto,
    public deviceInfo: { ip: string | null; title: string | null },
  ) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(
    private sessionRepo: SessionRepository,
    private jwtService: JwtService,
    private cryptoService: CryptoService,
    private userRepo: UserRepository,
  ) {}

  async execute(
    command: LoginUserCommand,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // find user by login or email
    const user = await this.userRepo.findByLoginOrEmail(
      command.dto.loginOrEmail,
    );
    if (!user) {
      throw new DomainException({
        code: HttpStatus.BAD_REQUEST,
        message: 'Not Found',
        extensions: [new Extension('User Not Found', 'loginOrEmail')],
      });
    }

    // is password correct
    if (
      !(await this.cryptoService.compare(
        command.dto.password,
        user.passwordHash,
      ))
    ) {
      throw new DomainException({
        code: HttpStatus.UNAUTHORIZED,
        message: 'Unauthorized',
        extensions: [new Extension('Incorrect Data', 'password')],
      });
    }

    // create payload
    const payload = {
      sub: user.id.toString(),
      login: user.login,
    };

    // create device id
    const deviceId = crypto.randomUUID();

    // token version
    const tokenVersion = 0;

    // create refresh token and save in DB
    const refreshToken = await this.jwtService.signAsync(
      {
        ...payload,
        deviceId: deviceId,
      },
      {
        expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRE_IN),
        secret: process.env.REFRESH_TOKEN_SECRET,
      },
    );
    const createSessionDto: CreateSessionDto = {
      refreshToken: refreshToken,
      tokenVersion: tokenVersion,
      title: command.deviceInfo.title,
      ip: command.deviceInfo.ip,
      deviceId: deviceId,
    };
    const session = Session.createInstance(createSessionDto, user);
    await this.sessionRepo.save(session);
    // create access token
    const accessToken = this.jwtService.sign({
      ...payload,
      tokenVersion: 0,
    });
    return { accessToken, refreshToken };
  }
}
