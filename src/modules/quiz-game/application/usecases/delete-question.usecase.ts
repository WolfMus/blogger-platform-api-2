import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionRepository } from '../../infrastructure/question.repository';
import {
  DomainException,
  Extension,
} from '../../../../core/exceptions/domain-exception';
import { HttpStatus } from '@nestjs/common';

export class DeleteQuestionCommand {
  constructor(public id: number) {}
}

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionUseCase implements ICommandHandler<DeleteQuestionCommand> {
  constructor(private questionRepo: QuestionRepository) {}
  async execute(command: DeleteQuestionCommand): Promise<void> {
    const isDeleted = await this.questionRepo.delete(command.id);
    if (!isDeleted) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Question Not Found', 'id')],
      });
    }
    return;
  }
}
