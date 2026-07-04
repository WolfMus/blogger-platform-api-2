import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserRequestDto } from '../../dto/input/create-user.request.dto';
import { CryptoService } from '../crypto.service';
import { CreateUserDomainDto } from '../../domain/users/dto/create-user.domain.dto';
import { UserPostgres } from '../../domain/users/postgresql/user.postgres.entity';
import { UserPostRepository } from '../../infrastructure/postgresql/user.postgres.repository';
import { UserPostgresResponseDto } from '../../infrastructure/postgresql/dto/user.response.dto';
import {
  DomainException,
  Extension,
} from '../../../../core/exceptions/domain-exception';
import { HttpStatus } from '@nestjs/common';

export class CreateUserCommand {
  constructor(public dto: CreateUserRequestDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<
  CreateUserCommand,
  UserPostgresResponseDto
> {
  constructor(
    private cryptoService: CryptoService,
    private userRepo: UserPostRepository,
  ) {}
  async execute(command: CreateUserCommand): Promise<UserPostgresResponseDto> {
    // // user exists?
    const isExist = await this.userRepo.isExistByLoginAndEmail(
      command.dto.login,
      command.dto.email,
    );
    if (isExist) {
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
    const user = UserPostgres.createInstance(createUserData);

    // save user
    const userResponse = await this.userRepo.create(user);
    return userResponse;
  }
}
