import { Injectable } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { UserPostRepository } from '../infrastructure/postgresql/user.postgres.repository';

@Injectable()
export class AuthService {
  constructor(
    private userPostRepo: UserPostRepository,
    private cryptoService: CryptoService,
  ) {}

  async validateUser(
    loginOrEmail: string,
    pass: string,
  ): Promise<{ id: string } | null> {
    const user = await this.userPostRepo.findByLoginOrEmail(loginOrEmail);
    console.log(user);
    if (!user) {
      return null;
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

    return { id: user.id.toString() };
  }
}
