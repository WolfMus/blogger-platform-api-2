import { Prop } from '@nestjs/mongoose';

export class CreateSessionDto {
  @Prop({ type: String, required: true })
  userId: string;
  @Prop({ type: String, required: true })
  refreshToken: string;
  @Prop({ type: Number, required: true })
  tokenVersion: number;
  @Prop({ type: String, nullable: true, required: true })
  title: string | null;
  @Prop({ type: String, nullable: true, required: true })
  ip: string | null;
  @Prop({ type: String, required: true })
  deviceId: string;
}
