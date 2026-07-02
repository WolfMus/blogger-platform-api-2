import { HttpStatus } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  DomainException,
  Extension,
} from '../../../../core/exceptions/domain-exception';
import { UserRepository } from '../../infrastructure/user.repository';
import { EmailService } from '../../../notifications/applications/email.service';

export class ResendConfirmationCodeCommand {
  constructor(public email: string) {}
}

@CommandHandler(ResendConfirmationCodeCommand)
export class ResendConfirmationCodeUseCase implements ICommandHandler<
  ResendConfirmationCodeCommand,
  void
> {
  constructor(
    private userRepo: UserRepository,
    private emailService: EmailService,
  ) {}

  async execute(command: ResendConfirmationCodeCommand): Promise<void> {
    // find user by email
    const user = await this.userRepo.findByEmailOrFail(command.email);

    // is status already true?
    if (user.confirmation.isConfirmed === true) {
      throw new DomainException({
        code: HttpStatus.BAD_REQUEST,
        message: 'Bad Request',
        extensions: [new Extension('Already registrated', 'email')],
      });
    }

    // create confirmation code and expires date
    user.setConfirmationCode();

    // save user
    await this.userRepo.save(user);

    // send confirmation code on user's email
    await this.emailService.sendConfirmationEmail(
      user.email,
      user.confirmation.confirmationCode!,
    );
    return;
  }
}
