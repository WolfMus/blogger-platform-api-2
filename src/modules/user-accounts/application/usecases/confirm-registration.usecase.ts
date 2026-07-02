import { HttpStatus } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  DomainException,
  Extension,
} from '../../../../core/exceptions/domain-exception';
import { UserRepository } from '../../infrastructure/user.repository';

export class ConfirmRegistrationCommand {
  constructor(public code: string) {}
}

@CommandHandler(ConfirmRegistrationCommand)
export class ConfirmRegistrationUseClass implements ICommandHandler<
  ConfirmRegistrationCommand,
  void
> {
  constructor(private userRepo: UserRepository) {}

  async execute(command: ConfirmRegistrationCommand): Promise<void> {
    // find user by confirmation code
    const user = await this.userRepo.findByConfirmationCode(command.code);
    console.log(user);
    // is code expired?
    if (user.confirmation.confirmationExpireDate!.getTime() < Date.now()) {
      throw new DomainException({
        code: HttpStatus.BAD_REQUEST,
        message: 'Bad Request',
        extensions: [new Extension('Code Expired', 'confirmationExpireDate')],
      });
    }
    console.log('checked');
    // is status already true?
    if (user.confirmation.isConfirmed === true) {
      throw new DomainException({
        code: HttpStatus.BAD_REQUEST,
        message: 'Bad Request',
        extensions: [new Extension('Already registrated', 'isConfirmed')],
      });
    }

    // change confirmation status
    user.isConfirmed();

    // save user
    return await this.userRepo.save(user);
  }
}
