import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionPaginationInput } from '../../types/question-pagination-input.type';
import { QuestionQwRepository } from '../../infrastructure/question/question-query.repository';
import { QuestionMapper } from '../../dto/mapper/question.mapper';

export class FindAllQuestionsCommand {
  constructor(public paginationInput: QuestionPaginationInput) {}
}

@CommandHandler(FindAllQuestionsCommand)
export class FindAllQuestionsUseCase implements ICommandHandler<FindAllQuestionsCommand> {
  constructor(private questionQueryRepo: QuestionQwRepository) {}
  async execute(command: FindAllQuestionsCommand): Promise<any> {
    const { questions, totalCount } = await this.questionQueryRepo.findAll(
      command.paginationInput,
    );
    return QuestionMapper.mapToPaginatedView(
      questions,
      command.paginationInput,
      totalCount,
    );
  }
}
