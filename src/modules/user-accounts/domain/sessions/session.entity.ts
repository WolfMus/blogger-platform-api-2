import { ApiSchema } from '@nestjs/swagger';
import { CreateSessionDto } from './dto/create-session.domain.dto';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/postgresql/user.postgres.entity';

@ApiSchema({ name: 'Sessions' })
@Entity({ name: 'session' })
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.id, {
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'refresh_token',
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  refreshToken: string;

  @Column({
    name: 'token_version',
    type: 'smallint',
    nullable: false,
    unique: false,
  })
  tokenVersion: number;

  @Column({
    name: 'title',
    type: 'varchar',
    nullable: true,
    unique: false,
  })
  title: string | null; // Device name: for example Chrome 105 (received by parsing http header "user-agent")

  @Column({
    name: 'ip',
    type: 'varchar',
    nullable: true,
    unique: false,
  })
  ip: string | null; // IP address of device during signing in

  @Column({
    name: 'device_id',
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  deviceId: string; // Id of connected device session

  @Column({
    name: 'last_active_date',
    type: 'timestamptz',
    nullable: false,
    unique: false,
  })
  lastActiveDate: Date; // Date of the last generating of refresh/access tokens

  static createInstance(dto: CreateSessionDto, user: User): Session {
    const session = new Session();
    session.user = user;
    session.refreshToken = dto.refreshToken;
    session.tokenVersion = dto.tokenVersion;
    session.title = dto.title;
    session.ip = dto.ip;
    session.deviceId = dto.deviceId;
    session.lastActiveDate = new Date();
    return session;
  }

  updateRefreshToken(refreshToken: string): void {
    this.refreshToken = refreshToken;
    this.lastActiveDate = new Date();
    this.tokenVersion += 1;
  }
}
