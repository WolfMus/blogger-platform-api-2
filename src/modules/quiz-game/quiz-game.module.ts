import { Module } from '@nestjs/common';
import { QuizGameController } from './api/quiz-game-sa.controller';
import { QuizGameService } from './application/quiz-game.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './domain/question.entity';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { QuestionRepository } from './infrastructure/question.repository';
import { CreateQuestionUseCase } from './application/usecases/create-question.usecase';
import { UpdateQuestionUseCase } from './application/usecases/update-question.usecase';
import { DeleteQuestionUseCase } from './application/usecases/delete-question.usecase';
import { PublishQuestionUseCase } from './application/usecases/publish-question.usecase';
import { FindAllQuestionsUseCase } from './application/usecases/find-all-question.usecase';
import { PairQuizGameController } from './api/pair-quiz-game.controller';
import { ConnectToPairGameUseCase } from './application/usecases/connection.usecase';

const questionUseCases = [
  CreateQuestionUseCase,
  UpdateQuestionUseCase,
  DeleteQuestionUseCase,
  PublishQuestionUseCase,
  FindAllQuestionsUseCase,
];

const pairGameUseCases = [ConnectToPairGameUseCase];

@Module({
  imports: [TypeOrmModule.forFeature([Question]), UserAccountsModule],
  controllers: [QuizGameController, PairQuizGameController],
  providers: [
    ...questionUseCases,
    ...pairGameUseCases,
    QuizGameService,
    QuestionRepository,
  ],
})
export class QuizGameModule {}
