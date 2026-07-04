import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailService } from '../../../notifications/applications/email.service';
import { UserPostRepository } from '../../infrastructure/postgresql/user.postgres.repository';

export class SendRecoveryCodeCommand {
  constructor(public email: string) {}
}

@CommandHandler(SendRecoveryCodeCommand)
export class SendRecoveryCodeUseClass implements ICommandHandler<
  SendRecoveryCodeCommand,
  void
> {
  constructor(
    private userPostRepo: UserPostRepository,
    private emailService: EmailService,
  ) {}

  async execute(command: SendRecoveryCodeCommand): Promise<void> {
    // find user by email
    // if user not found - return no content exception
    const user = await this.userPostRepo.findByEmail(command.email);
    if (!user) {
      return;
    }

    // create recovery code and expires date
    user.setRecoveryCode();

    // save user
    await this.userPostRepo.save(user);

    // send recovery code on user's email
    await this.emailService.sendPasswordRecoveryEmail(
      user.email,
      user.recoveryCode!,
    );
    return;
  }
}
