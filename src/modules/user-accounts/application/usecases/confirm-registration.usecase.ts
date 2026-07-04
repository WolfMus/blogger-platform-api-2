import { HttpStatus } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  DomainException,
  Extension,
} from '../../../../core/exceptions/domain-exception';
import { UserPostRepository } from '../../infrastructure/postgresql/user.postgres.repository';

export class ConfirmRegistrationCommand {
  constructor(public code: string) {}
}

@CommandHandler(ConfirmRegistrationCommand)
export class ConfirmRegistrationUseClass implements ICommandHandler<
  ConfirmRegistrationCommand,
  void
> {
  constructor(private userPostRepo: UserPostRepository) {}

  async execute(command: ConfirmRegistrationCommand): Promise<void> {
    // find user by confirmation code
    const user = await this.userPostRepo.findByConfirmationCode(command.code);
    if (!user) {
      throw new DomainException({
        code: HttpStatus.BAD_REQUEST,
        message: 'Not Found',
        extensions: [new Extension('Confirmation Code Not Found', 'code')],
      });
    }

    // is code expired?
    if (user.confirmationCodeExpireDate!.getTime() < Date.now()) {
      throw new DomainException({
        code: HttpStatus.BAD_REQUEST,
        message: 'Bad Request',
        extensions: [new Extension('Code Expired', 'confirmationExpireDate')],
      });
    }

    // is status already true?
    if (user.isConfirmed === true) {
      throw new DomainException({
        code: HttpStatus.BAD_REQUEST,
        message: 'Bad Request',
        extensions: [new Extension('Already registrated', 'isConfirmed')],
      });
    }

    // change confirmation status
    user.changeAccoutConfirmation();

    // save user
    return await this.userPostRepo.save(user);
  }
}
