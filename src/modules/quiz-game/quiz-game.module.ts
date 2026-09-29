import { Module } from '@nestjs/common';
import { QuizGameController } from './api/quiz-game-sa.controller';
import { QuizGameService } from './application/quiz-game.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './domain/question.entity';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { CreateQuestionUseCase } from './application/usecases/create-question.usecase';
import { UpdateQuestionUseCase } from './application/usecases/update-question.usecase';
import { DeleteQuestionUseCase } from './application/usecases/delete-question.usecase';
import { PublishQuestionUseCase } from './application/usecases/publish-question.usecase';
import { FindAllQuestionsUseCase } from './application/usecases/find-all-question.usecase';
import { PairQuizGameController } from './api/pair-quiz-game.controller';
import { ConnectToPairGameUseCase } from './application/usecases/connection.usecase';
import { QuizGame } from './domain/quiz-game.entity';
import { GamePlayer } from './domain/game-players.entity';
import { GamePlayerAnswers } from './domain/game-answers.entity';
import { GameQwRepository } from './infrastructure/game/game-query.repository';
import { GameRepository } from './infrastructure/game/game.repository';
import { GamePlayerQwRepository } from './infrastructure/player/game-player-query.repository';
import { GamePlayerRepository } from './infrastructure/player/game-player.repository';
import { QuestionQwRepository } from './infrastructure/question/question-query.repository';
import { QuestionRepository } from './infrastructure/question/question.repository';

const questionUseCases = [
  CreateQuestionUseCase,
  UpdateQuestionUseCase,
  DeleteQuestionUseCase,
  PublishQuestionUseCase,
  FindAllQuestionsUseCase,
];

const pairGameUseCases = [ConnectToPairGameUseCase];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Question,
      QuizGame,
      GamePlayer,
      GamePlayerAnswers,
    ]),
    UserAccountsModule,
  ],
  controllers: [QuizGameController, PairQuizGameController],
  providers: [
    ...questionUseCases,
    ...pairGameUseCases,
    QuizGameService,
    QuestionRepository,
    QuestionQwRepository,
    GameRepository,
    GameQwRepository,
    GamePlayerRepository,
    GamePlayerQwRepository,
  ],
})
export class QuizGameModule {}
