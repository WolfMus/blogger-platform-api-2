import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserRequestDto } from '../../dto/input/create-user.request.dto';
import { CryptoService } from '../crypto.service';
import { CreateUserDomainDto } from '../../domain/users/dto/create-user.domain.dto';
import { UserRepository } from '../../infrastructure/users/user.repository';
import {
  DomainException,
  Extension,
} from '../../../../core/exceptions/domain-exception';
import { HttpStatus } from '@nestjs/common';
import { UserResponseDto } from '../../dto/user.response.dto';
import { UserMapper } from '../../dto/mapper/user.mapper';
import { User } from '../../domain/users/user.entity';

export class CreateUserCommand {
  constructor(public dto: CreateUserRequestDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<
  CreateUserCommand,
  UserResponseDto
> {
  constructor(
    private cryptoService: CryptoService,
    private userRepo: UserRepository,
    private userMapper: UserMapper,
  ) {}
  async execute(command: CreateUserCommand): Promise<UserResponseDto> {
    // user exists?
    const user = await this.userRepo.findByLoginAndEmail(
      command.dto.login,
      command.dto.email,
    );
    if (user) {
      throw new DomainException({
        code: HttpStatus.BAD_REQUEST,
        message: 'Exists',
        extensions: [new Extension('User exist', 'login or email')],
      });
    }

    // generate hash and create user domain dto
    const passwordHash = await this.cryptoService.generatePasswordHash(
      command.dto.password,
    );
    const createUserData: CreateUserDomainDto = {
      login: command.dto.login,
      email: command.dto.email,
      passwordHash: passwordHash,
    };

    // create user instance
    const newUser = User.createInstance(createUserData);

    // save user
    const savedUser = await this.userRepo.save(newUser);
    if (!savedUser) {
      throw new Error('User Was Not Saved');
    }
    return this.userMapper.toResponseView(savedUser);
  }
}
