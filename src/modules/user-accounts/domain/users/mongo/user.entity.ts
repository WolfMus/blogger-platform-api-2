import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CreateUserDomainDto } from '../dto/create-user.domain.dto';
import { ApiSchema } from '@nestjs/swagger';
import { HydratedDocument, Model } from 'mongoose';
import { randomUUID } from 'node:crypto';
import { add } from 'date-fns';

@Schema({ _id: false })
class Confirmation {
  @Prop({ type: Boolean, default: false })
  isConfirmed: boolean;
  @Prop({ type: String, nullable: true, default: null })
  confirmationCode: string | null;
  @Prop({ type: Date, nullable: true, default: null })
  confirmationExpireDate: Date | null;
}

@Schema({ _id: false })
class Recovery {
  @Prop({ type: String, nullable: true, default: null })
  recoveryCode: string | null;
  @Prop({ type: Date, nullable: true, default: null })
  recoveryCodeExpireDate: Date | null;
}

@ApiSchema({ name: 'User Entity' })
@Schema()
export class User {
  @Prop({ type: String, required: true })
  login: string;
  @Prop({ type: String, required: true })
  email: string;
  @Prop({ type: String, required: true })
  passwordHash: string;
  @Prop({ type: Date, required: true })
  createdAt: Date;
  @Prop({ type: Date, default: null })
  updatedAt: Date;
  @Prop({ type: Confirmation, required: true, default: () => ({}) })
  confirmation: Confirmation;
  @Prop({ type: Recovery, required: true, default: () => ({}) })
  recovery: Recovery;

  static createInstance(dto: CreateUserDomainDto): UserDocument {
    const user = new this();
    user.login = dto.login;
    user.email = dto.email;
    user.passwordHash = dto.passwordHash;
    user.createdAt = new Date();
    return user as UserDocument;
  }

  setConfirmationCode(): void {
    this.confirmation.confirmationCode = randomUUID();
    this.confirmation.confirmationExpireDate = add(new Date(), {
      minutes: 5,
    });
  }

  isConfirmed(): void {
    this.confirmation.isConfirmed = true;
    this.confirmation.confirmationCode = null;
    this.confirmation.confirmationExpireDate = null;
  }

  setRecoveryCode(): void {
    this.recovery.recoveryCode = randomUUID();
    this.recovery.recoveryCodeExpireDate = add(new Date(), {
      minutes: 5,
    });
  }

  setNewPassword(password: string): void {
    this.passwordHash = password;
    this.recovery.recoveryCode = null;
    this.recovery.recoveryCodeExpireDate = null;
    this.updatedAt = new Date();
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

// регистрирует методы сущности в схеме
UserSchema.loadClass(User);

// типизация документа
export type UserDocument = HydratedDocument<User>;

// типизация модели + статические методы
export type UserModelType = Model<UserDocument> & typeof User;
