import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateQuestionDto } from '../../dto/create-question.dto';
import { QuestionRepository } from '../../infrastructure/question.repository';
import {
  DomainException,
  Extension,
} from '../../../../core/exceptions/domain-exception';
import { HttpStatus } from '@nestjs/common';

export class UpdateQuestionCommand {
  constructor(
    public id: number,
    public dto: CreateQuestionDto,
  ) {}
}

@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionUseCase implements ICommandHandler<UpdateQuestionCommand> {
  constructor(private questionRepo: QuestionRepository) {}
  async execute(command: UpdateQuestionCommand): Promise<void> {
    const question = await this.questionRepo.findById(command.id);
    if (!question) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Question Not Found', 'id')],
      });
    }
    question.updateQuestion(command.dto);
    const questionSaved = await this.questionRepo.save(question);
    if (!questionSaved) {
      throw new Error('Question Was Not Saved');
    }
    return;
  }
}
