import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiSchema } from '@nestjs/swagger';
import { HydratedDocument, Model } from 'mongoose';
import { CreateSessionDto } from './dto/create-session.domain.dto';

@ApiSchema({ name: 'Sessions' })
@Schema()
export class Session {
  @Prop({ type: String, required: true })
  userId: string;
  @Prop({ type: String, required: true })
  refreshToken: string;
  @Prop({ type: Number, required: true })
  tokenVersion: number;
  @Prop({ type: String, nullable: true, required: true })
  title: string | null; // Device name: for example Chrome 105 (received by parsing http header "user-agent")
  @Prop({ type: String, nullable: true, required: true })
  ip: string | null; // IP address of device during signing in
  @Prop({ type: String, required: true })
  deviceId: string; // Id of connected device session
  @Prop({ type: Date, required: true })
  lastActiveDate: Date; // Date of the last generating of refresh/access tokens

  static createInstance(dto: CreateSessionDto): SessionDocument {
    const session = new this();
    session.userId = dto.userId;
    session.refreshToken = dto.refreshToken;
    session.tokenVersion = dto.tokenVersion;
    session.title = dto.title;
    session.ip = dto.ip;
    session.deviceId = dto.deviceId;
    session.lastActiveDate = new Date();
    return session as SessionDocument;
  }

  updateRefreshToken(refreshToken: string): void {
    this.refreshToken = refreshToken;
    this.lastActiveDate = new Date();
    this.tokenVersion += 1;
  }
}

export const SessionSchema = SchemaFactory.createForClass(Session);

// регистрирует методы сущности в схеме
SessionSchema.loadClass(Session);

// типизация документа
export type SessionDocument = HydratedDocument<Session>;

// типизация модели + статические методы
export type SessionModelType = Model<SessionDocument> & typeof Session;
