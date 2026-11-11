import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SortDirection } from '../../../../core/dto/pagination.request.dto';
import { Question } from '../../domain/question.entity';
import {
  QuestionPaginationInput,
  PublishedStatus,
} from '../../types/question-pagination-input.type';
import { QuestionResponseType } from '../../types/question-response.type';
import { QuestionViewModel } from '../../dto/question/question-view-model';
import { QuestionMapper } from '../../dto/mapper/question.mapper';

@Injectable()
export class QuestionQwRepository {
  constructor(
    @InjectRepository(Question)
    private questionRepo: Repository<Question>,
  ) {}

  async findById(id: string): Promise<QuestionViewModel | null> {
    const question = await this.questionRepo.findOne({ where: { id } });
    if (!question) return null;
    return QuestionMapper.toViewModel(question);
  }

  async findQuestionsByIds(ids: string[]): Promise<QuestionResponseType[]> {
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

  async findAll(
    pagination: QuestionPaginationInput,
  ): Promise<{ questions: QuestionViewModel[]; totalCount: number }> {
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
      questions: QuestionMapper.mapToViewModel(questions),
      totalCount,
    };
  }
}
