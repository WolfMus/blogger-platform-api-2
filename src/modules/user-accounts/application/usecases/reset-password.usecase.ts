import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NewPasswordDto } from '../../dto/input/new-password.dto';
import { HttpStatus } from '@nestjs/common';
import {
  DomainException,
  Extension,
} from '../../../../core/exceptions/domain-exception';
import { CryptoService } from '../crypto.service';
import { UserRepository } from '../../infrastructure/users/user.repository';

export class ResetPasswordCommand {
  constructor(public dto: NewPasswordDto) {}
}

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordUseCase implements ICommandHandler<
  ResetPasswordCommand,
  void
> {
  constructor(
    private userRepo: UserRepository,
    private cryptoService: CryptoService,
  ) {}

  async execute(command: ResetPasswordCommand): Promise<void> {
    // find user by recovery code
    const user = await this.userRepo.findByRecoveryCode(
      command.dto.recoveryCode,
    );
    if (!user) {
      throw new DomainException({
        code: HttpStatus.BAD_REQUEST,
        message: 'Not Found',
        extensions: [new Extension('Recovery Code Not Found', 'recoveryCode')],
      });
    }

    // is code expired?
    if (user.recoveryCodeExpireDate!.getTime() < Date.now()) {
      throw new DomainException({
        code: HttpStatus.BAD_REQUEST,
        message: 'Bad Request',
        extensions: [new Extension('Code Expired', 'confirmationExpireDate')],
      });
    }

    // password to hash
    const passwordHash = await this.cryptoService.generatePasswordHash(
      command.dto.newPassword,
    );
    // set new password
    user.setNewPassword(passwordHash);

    // save user
    await this.userRepo.save(user);

    return;
  }
}
