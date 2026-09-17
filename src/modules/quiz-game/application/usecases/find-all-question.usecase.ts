import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionRepository } from '../../infrastructure/question.repository';
import { QuestionPaginationInput } from '../../types/question-pagination-input.type';
import { QuestionViewModel } from '../../dto/question-view-model';

export class FindAllQuestionsCommand {
  constructor(public paginationInput: QuestionPaginationInput) {}
}

@CommandHandler(FindAllQuestionsCommand)
export class FindAllQuestionsUseCase implements ICommandHandler<FindAllQuestionsCommand> {
  constructor(private questionRepo: QuestionRepository) {}
  async execute(command: FindAllQuestionsCommand): Promise<any> {
    const { questions, totalCount } = await this.questionRepo.findAll(
      command.paginationInput,
    );
    return QuestionViewModel.mapToPaginatedView(
      questions,
      command.paginationInput,
      totalCount,
    );
  }
}
