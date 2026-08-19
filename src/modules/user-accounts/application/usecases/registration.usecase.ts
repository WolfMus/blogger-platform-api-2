import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserRequestDto } from '../../dto/input/create-user.request.dto';
import { EmailService } from '../../../notifications/applications/email.service';
import { CreateUserCommand } from './create-user.usecase';
import { UserResponseDto } from '../../dto/user.response.dto';
import { HttpStatus } from '@nestjs/common';
import {
  DomainException,
  Extension,
} from '../../../../core/exceptions/domain-exception';
import { UserRepository } from '../../infrastructure/users/user.repository';

export class RegistrationUserCommand {
  constructor(public dto: CreateUserRequestDto) {}
}

@CommandHandler(RegistrationUserCommand)
export class RegistrationUserUseCase implements ICommandHandler<
  RegistrationUserCommand,
  void
> {
  constructor(
    private emailService: EmailService,
    private commandBus: CommandBus,
    private userRepo: UserRepository,
  ) {}

  async execute(command: RegistrationUserCommand): Promise<void> {
    // creates user
    const userDto = await this.commandBus.execute<
      CreateUserCommand,
      UserResponseDto
    >(new CreateUserCommand(command.dto));
    const user = await this.userRepo.findById(userDto.id);
    if (!user) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('User Not Found', 'id')],
      });
    }
    // create confirmation code and expires date
    user.setConfirmationCode();
    await this.userRepo.save(user);

    // send confirmation code on user's email
    await this.emailService.sendConfirmationEmail(
      user.email,
      user.confirmationCode!,
    );
    return;
  }
}
