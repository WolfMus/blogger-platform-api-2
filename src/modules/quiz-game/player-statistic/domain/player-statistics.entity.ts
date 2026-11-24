import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../../user-accounts/domain/users/user.entity';
import { CreatePlayerStatisticDomainDto } from '../dto/create-statistic.domain.dto';

@Entity({ name: 'playerStatistic' })
export class PlayerStatistic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'userId',
    type: 'uuid',
    nullable: false,
  })
  userId: string;

  @ManyToOne(() => User, (user) => user.gamePlayers)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    name: 'sumScore',
    type: 'integer',
    nullable: false,
  })
  sumScore: number;

  @Column({
    name: 'gamesCount',
    type: 'integer',
    nullable: false,
  })
  gamesCount: number;

  @Column({
    name: 'winsCount',
    type: 'integer',
    nullable: false,
  })
  winsCount: number;

  @Column({
    name: 'lossesCount',
    type: 'integer',
    nullable: false,
  })
  lossesCount: number;

  @Column({
    name: 'drawsCount',
    type: 'integer',
    nullable: false,
  })
  drawsCount: number;

  static createInstance(dto: CreatePlayerStatisticDomainDto): PlayerStatistic {
    const statistic = new PlayerStatistic();
    statistic.userId = dto.userId;
    statistic.sumScore = dto.sumScore;
    statistic.gamesCount = dto.gamesCount;
    statistic.winsCount = dto.winsCount;
    statistic.lossesCount = dto.lossesCount;
    statistic.drawsCount = dto.drawsCount;
    return statistic;
  }

  increaseSumScore(points: number): void {
    this.sumScore += points;
  }

  increaseWinsCount(): void {
    this.winsCount += 1;
    this.gamesCount += 1;
  }

  increaseLossesCount(): void {
    this.lossesCount += 1;
    this.gamesCount += 1;
  }

  increaseDrawsCount(): void {
    this.drawsCount += 1;
    this.gamesCount += 1;
  }
}
