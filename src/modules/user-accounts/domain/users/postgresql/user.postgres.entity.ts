import { CreateUserDomainDto } from '../dto/create-user.domain.dto';
import { randomUUID } from 'node:crypto';
import { add } from 'date-fns';
import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { BaseDbEntity } from '../../../../../core/db/entities/base-db.entity';
import { Session } from '../../sessions/session.entity';
import { CommentPostgres } from '../../../../blogger-platform/comments/domain/comment-postgres';

@Entity({ name: 'users' })
export class UserPostgres extends BaseDbEntity {
  @Column({
    name: 'login',
    type: 'varchar',
    length: 10,
    unique: true,
  })
  login: string;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    unique: true,
  })
  email: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
  })
  passwordHash: string;

  @Column({
    name: 'is_confirmed',
    type: 'boolean',
    default: false,
  })
  isConfirmed: boolean;

  @Column({
    name: 'recovery_code',
    type: 'varchar',
    nullable: true,
    unique: true,
  })
  recoveryCode: string | null;

  @Column({
    name: 'recovery_code_expire_date',
    type: 'timestamptz',
    nullable: true,
  })
  recoveryCodeExpireDate: Date | null;

  @Column({
    name: 'confirmation_code',
    type: 'varchar',
    nullable: true,
    unique: true,
  })
  confirmationCode: string | null;

  @Column({
    name: 'confirmation_code_expire_date',
    type: 'timestamptz',
    nullable: true,
  })
  confirmationCodeExpireDate: Date | null;

  @OneToOne(() => Session, (session) => session.user, {
    cascade: true,
  })
  session: Session;

  @OneToMany(() => CommentPostgres, (comment) => comment.user)
  comments: CommentPostgres[];

  static createInstance(dto: CreateUserDomainDto) {
    const user = new UserPostgres();
    user.login = dto.login;
    user.email = dto.email;
    user.passwordHash = dto.passwordHash;
    return user;
  }

  setConfirmationCode(): void {
    this.confirmationCode = randomUUID();
    this.confirmationCodeExpireDate = add(new Date(), {
      minutes: 5,
    });
  }

  changeAccoutConfirmation(): void {
    this.isConfirmed = true;
    this.confirmationCode = null;
    this.confirmationCodeExpireDate = null;
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
  }
}
