import { InjectRepository } from '@nestjs/typeorm';
import { Question } from '../domain/question.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import {
  PublishedStatus,
  QuestionPaginationInput,
} from '../types/question-pagination-input.type';
import { SortDirection } from '../../../core/dto/pagination.request.dto';
import { QuestionResponseType } from '../types/question-response.type';

@Injectable()
export class QuestionRepository {
  constructor(
    @InjectRepository(Question)
    private questionRepo: Repository<Question>,
  ) {}

  async findById(id: string): Promise<Question | null> {
    const question = await this.questionRepo.findOne({ where: { id } });
    if (!question) return null;
    return question;
  }

  async findByIds(ids: string[]): Promise<QuestionResponseType[]> {
    const raw = await this.questionRepo
      .createQueryBuilder('q')
      .select('q.id', 'id')
      .addSelect('q.body', 'body')
      .where('q.id IN (:...ids)', { ids })
      .getRawMany<QuestionResponseType>();

    if (raw.length !== ids.length) {
      throw new Error('Not All Questions Founded');
    }

    return raw;
  }

  async findQuestionsForGame(): Promise<QuestionResponseType[]> {
    const limit = 5;
    const raw = await this.questionRepo
      .createQueryBuilder('q')
      .select('q.id', 'id')
      .addSelect('q.body', 'body')
      .where('q.published = True')
      .orderBy('RANDOM()')
      .limit(limit)
      .getRawMany<QuestionResponseType>();

    if (raw.length !== limit) {
      throw new Error('Not All Questions Founded');
    }

    return raw;
  }

  async save(question: Question): Promise<Question | null> {
    const saved = await this.questionRepo.save(question);
    return saved;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.questionRepo.delete({ id: id });
    return deleted.affected === 1;
  }

  async findAll(
    pagination: QuestionPaginationInput,
  ): Promise<{ questions: Question[]; totalCount: number }> {
    const sortBy = pagination.sortBy ?? 'createdAt';
    const sortDirection =
      pagination.sortDirection === SortDirection.Asc ? 'ASC' : 'DESC';
    const pageNumber = pagination.pageNumber ?? 1;
    const pageSize = pagination.pageSize ?? 10;
    const offset = (pageNumber - 1) * pageSize;

    const query = this.questionRepo
      .createQueryBuilder('question')
      .orderBy(`question.${sortBy}`, sortDirection)
      .skip(offset)
      .take(pageSize);

    if (pagination.bodySearchTerm) {
      query.andWhere('question.body ILIKE :searchNameTerm', {
        searchNameTerm: `%${pagination.bodySearchTerm}%`,
      });
    }

    if (pagination.publishedStatus === PublishedStatus.Published) {
      query.andWhere('question.published = true');
    } else if (pagination.publishedStatus === PublishedStatus.NotPublished) {
      query.andWhere('question.published = false');
    }

    const [questions, totalCount] = await query.getManyAndCount();

    return {
      questions,
      totalCount,
    };
  }
}
