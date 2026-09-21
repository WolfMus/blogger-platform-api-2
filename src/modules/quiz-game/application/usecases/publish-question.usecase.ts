import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionRepository } from '../../infrastructure/question.repository';
import { PublishQuestionDto } from '../../dto/question-publish.dto';
import {
  DomainException,
  Extension,
} from '../../../../core/exceptions/domain-exception';
import { HttpStatus } from '@nestjs/common';

export class PublishQuestionCommand {
  constructor(
    public id: string,
    public dto: PublishQuestionDto,
  ) {}
}

@CommandHandler(PublishQuestionCommand)
export class PublishQuestionUseCase implements ICommandHandler<PublishQuestionCommand> {
  constructor(private questionRepo: QuestionRepository) {}
  async execute(command: PublishQuestionCommand): Promise<void> {
    const question = await this.questionRepo.findById(command.id);
    if (!question) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Question Not Found', 'id')],
      });
    }
    question.changePublish(command.dto.publish);
    const savedQuestion = await this.questionRepo.save(question);
    if (!savedQuestion) {
      throw new Error('Question Was Not Saved');
    }
    return;
  }
}
