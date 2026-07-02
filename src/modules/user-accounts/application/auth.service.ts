import { Injectable } from '@nestjs/common';
import { UserRepository } from '../infrastructure/user.repository';
import { CryptoService } from './crypto.service';

@Injectable()
export class AuthService {
  constructor(
    private userRepo: UserRepository,
    private cryptoService: CryptoService,
  ) {}

  async validateUser(
    loginOrEmail: string,
    pass: string,
  ): Promise<{ id: string } | null> {
    const user = await this.userRepo.findByLoginOrEmail(loginOrEmail);
    if (!user) {
      return null;
      // throw new DomainException({
      //   code: HttpStatus.NOT_FOUND,
      //   message: 'Not Found',
      //   extensions: [new Extension('User Not Found', 'code')],
      // });
    }
    const isPasswordValid = await this.cryptoService.compare(
      pass,
      user.passwordHash,
    );
    if (!user) {
      return null;
    }
    if (!isPasswordValid) {
      return null;
    }

    return { id: user._id.toString() };
  }
}
