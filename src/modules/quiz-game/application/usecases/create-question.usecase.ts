import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateQuestionDto } from '../../dto/create-question.dto';
import { Question } from '../../domain/question.entity';
import { QuestionRepository } from '../../infrastructure/question.repository';
import { QuestionViewModel } from '../../dto/question-view-model';

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
    return QuestionViewModel.mapToView(question);
  }
}
