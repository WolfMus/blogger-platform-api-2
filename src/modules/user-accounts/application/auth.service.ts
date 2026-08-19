import { Injectable } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { UserRepository } from '../infrastructure/postgresql/user.sql.repository';

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
