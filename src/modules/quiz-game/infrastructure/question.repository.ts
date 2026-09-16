import { InjectRepository } from '@nestjs/typeorm';
import { Question } from '../domain/question.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class QuestionRepository {
  constructor(
    @InjectRepository(Question)
    private questionRepo: Repository<Question>,
  ) {}

  async findById(id: number): Promise<Question | null> {
    const question = await this.questionRepo.findOne({ where: { id } });
    if (!question) return null;
    return question;
  }

  async save(question: Question): Promise<Question | null> {
    const saved = await this.questionRepo.save(question);
    return saved;
  }

  async delete(id: number): Promise<boolean> {
    const deleted = await this.questionRepo.delete({ id: id });
    return deleted.affected === 1;
  }
}
