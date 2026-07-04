import { Module } from '@nestjs/common';
import { UserController } from './api/user.controller';
import { UserService } from './application/user.service';
import { UserRepository } from './infrastructure/user.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { UserMapper } from './dto/mapper/user.mapper';
import { AuthController } from './api/auth.controller';
import { AuthService } from './application/auth.service';
import { CryptoService } from './application/crypto.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { JwtModule } from '@nestjs/jwt';
import { Session } from './domain/sessions/session.entity';
import { UserQwRepository } from './infrastructure/user-query.repository';
import { SessionRepository } from './infrastructure/sessions/session.repository';
import { LoginUserUseCase } from './application/usecases/login.usecase';
import { RegistrationUserUseCase } from './application/usecases/registration.usecase';
import { CreateUserUseCase } from './application/usecases/create-user.usecase';
import { ConfirmRegistrationUseClass } from './application/usecases/confirm-registration.usecase';
import { SendRecoveryCodeUseClass } from './application/usecases/send-recovery-code.usecase';
import { ResetPasswordUseCase } from './application/usecases/reset-password.usecase';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './guards/local/local.strategy';
import { JwtStrategy } from './guards/bearer/jwt.strategy';
import { ResendConfirmationCodeUseCase } from './application/usecases/resend-confirmation-code.usecase';
import { SessionsController } from './api/secutiry.controller';
import { SessionService } from './application/session.service';
import { RefreshJwtStrategy } from './guards/refrresh-token/cookie.strategy';
import { SessionMapper } from './dto/mapper/session.mapper';
import { RefreshTokenUseCase } from './application/usecases/session/refresh-token.usecase';
import { LogoutUseCase } from './application/usecases/logout.usecase';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPostgres } from './domain/users/postgresql/user.postgres.entity';
import { UserPostRepository } from './infrastructure/postgresql/user.postgres.repository';
import { User, UserSchema } from './domain/users/mongo/user.entity';

const userUseCases = [
  CreateUserUseCase,
  LoginUserUseCase,
  RegistrationUserUseCase,
  ConfirmRegistrationUseClass,
  RegistrationUserUseCase,
  SendRecoveryCodeUseClass,
  ResetPasswordUseCase,
  ResendConfirmationCodeUseCase,
  LogoutUseCase,
];

const sessionUseCases = [RefreshTokenUseCase];

@Module({
  imports: [
    TypeOrmModule.forFeature([UserPostgres, Session]),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      // { name: Session.name, schema: SessionSchema },
    ]),
    NotificationsModule,
    JwtModule.register({
      global: true,
      secret: 'access-token-secret',
      signOptions: { expiresIn: '10s' },
    }),
    PassportModule,
  ],
  controllers: [UserController, AuthController, SessionsController],
  providers: [
    UserService,
    UserRepository,
    UserPostRepository,
    UserQwRepository,
    UserMapper,
    AuthService,
    CryptoService,
    ...userUseCases,
    ...sessionUseCases,
    LocalStrategy,
    JwtStrategy,
    RefreshJwtStrategy,
    SessionService,
    SessionRepository,
    SessionMapper,
  ],
  exports: [UserRepository, JwtStrategy],
})
export class UserAccountsModule {}
