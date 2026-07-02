import { CreateUserDomainDto } from '../dto/create-user.domain.dto';
import { randomUUID } from 'node:crypto';
import { add } from 'date-fns';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserPostgres {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({
    type: 'varchar',
    length: 10,
    unique: true,
  })
  login: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 20,
  })
  passwordHash: string;

  @Column({
    type: 'timestamptz',
  })
  createdAt: Date;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  updatedAt: Date | null;

  @Column({
    type: 'varchar',
    nullable: true,
    unique: true,
  })
  recoveryCode: string | null;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  recoveryCodeExpireDate: Date | null;

  @Column({
    type: 'boolean',
    default: false,
  })
  isConfirmed: boolean;

  @Column({
    type: 'varchar',
    nullable: true,
    unique: true,
  })
  confirmationCode: string | null;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  confirmationExpireDate: Date | null;

  static createInstance(dto: CreateUserDomainDto) {
    const user = new UserPostgres();
    user.login = dto.login;
    user.email = dto.email;
    user.passwordHash = dto.passwordHash;
    user.createdAt = new Date();
    return user;
  }

  setConfirmationCode(): void {
    this.confirmationCode = randomUUID();
    this.confirmationExpireDate = add(new Date(), {
      minutes: 5,
    });
  }

  isEmailConfirmed(): void {
    this.isConfirmed = true;
    this.confirmationCode = null;
    this.confirmationExpireDate = null;
  }

  setRecoveryCode(): void {
    this.recoveryCode = randomUUID();
    this.recoveryCodeExpireDate = add(new Date(), {
      minutes: 5,
    });
  }

  setNewPassword(password: string): void {
    this.passwordHash = password;
    this.recoveryCode = null;
    this.recoveryCodeExpireDate = null;
    this.updatedAt = new Date();
  }
}
