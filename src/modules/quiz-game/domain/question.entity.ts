import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CreateQuestionDto } from '../dto/create-question.dto';

@Entity({ name: 'questions' })
export class Question {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    name: 'body',
    type: 'varchar',
    length: 500,
    nullable: false,
  })
  body: string;

  @Column({
    name: 'correctAnswers',
    type: 'varchar',
    array: true,
    nullable: false,
  })
  correctAnswers: string[];

  @Column({
    name: 'published',
    type: 'boolean',
    default: false,
  })
  published: boolean;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;

  static createInstance(dto: CreateQuestionDto): Question {
    const question = new Question();
    question.body = dto.body;
    question.correctAnswers = dto.correctAnswers;
    return question;
  }

  changePublish(dto: boolean): void {
    this.published = dto;
  }

  updateQuestion(dto: CreateQuestionDto): void {
    this.body = dto.body;
    this.correctAnswers = dto.correctAnswers;
  }
}
