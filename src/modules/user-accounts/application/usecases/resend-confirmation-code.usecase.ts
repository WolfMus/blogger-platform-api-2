import { HttpStatus } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  DomainException,
  Extension,
} from '../../../../core/exceptions/domain-exception';
import { EmailService } from '../../../notifications/applications/email.service';
import { UserPostRepository } from '../../infrastructure/postgresql/user.postgres.repository';

export class ResendConfirmationCodeCommand {
  constructor(public email: string) {}
}

@CommandHandler(ResendConfirmationCodeCommand)
export class ResendConfirmationCodeUseCase implements ICommandHandler<
  ResendConfirmationCodeCommand,
  void
> {
  constructor(
    private userPostRepo: UserPostRepository,
    private emailService: EmailService,
  ) {}

  async execute(command: ResendConfirmationCodeCommand): Promise<void> {
    // find user by email
    const user = await this.userPostRepo.findByEmail(command.email);
    if (!user) {
      throw new DomainException({
        code: HttpStatus.BAD_REQUEST,
        message: 'Not Found',
        extensions: [new Extension('User Not Found', 'email')],
      });
    }

    // is status already true?
    if (user.isConfirmed === true) {
      throw new DomainException({
        code: HttpStatus.BAD_REQUEST,
        message: 'Bad Request',
        extensions: [new Extension('Already registrated', 'email')],
      });
    }

    // create confirmation code and expires date
    user.setConfirmationCode();

    // save user
    await this.userPostRepo.save(user);

    // send confirmation code on user's email
    await this.emailService.sendConfirmationEmail(
      user.email,
      user.confirmationCode!,
    );
    return;
  }
}
