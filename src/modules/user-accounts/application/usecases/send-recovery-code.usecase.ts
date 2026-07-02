import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../../infrastructure/user.repository';
import { EmailService } from '../../../notifications/applications/email.service';

export class SendRecoveryCodeCommand {
  constructor(public email: string) {}
}

@CommandHandler(SendRecoveryCodeCommand)
export class SendRecoveryCodeUseClass implements ICommandHandler<
  SendRecoveryCodeCommand,
  void
> {
  constructor(
    private userRepo: UserRepository,
    private emailService: EmailService,
  ) {}

  async execute(command: SendRecoveryCodeCommand): Promise<void> {
    // find user by email
    // if user not found - return no content exception
    const user = await this.userRepo.findByEmail(command.email);
    if (!user) {
      return;
    }

    // create recovery code and expires date
    user.setRecoveryCode();

    // save user
    await this.userRepo.save(user);

    // send recovery code on user's email
    await this.emailService.sendPasswordRecoveryEmail(
      user.email,
      user.recovery.recoveryCode!,
    );
    return;
  }
}
