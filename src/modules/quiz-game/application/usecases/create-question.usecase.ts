import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateQuestionDto } from '../../dto/question/create-question.dto';
import { Question } from '../../domain/question.entity';
import { QuestionMapper } from '../../dto/mapper/question.mapper';
import { QuestionRepository } from '../../infrastructure/question/question.repository';

export class CreateQuestionCommand {
  constructor(public dto: CreateQuestionDto) {}
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUseCase implements ICommandHandler<CreateQuestionCommand> {
  constructor(private questionRepo: QuestionRepository) {}
  async execute(command: CreateQuestionCommand): Promise<any> {
    const question = Question.createInstance(command.dto);
    const savedQuestion = await this.questionRepo.save(question);
    if (!savedQuestion) {
      throw new Error('Question Was Not Saved');
    }
    return QuestionMapper.toViewModel(question);
  }
}
