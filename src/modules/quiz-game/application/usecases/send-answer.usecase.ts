import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AnswerResponseDto } from '../../dto/answer-response.dto';
import { AnswerRequestDto } from '../../dto/answer-request.dto';
import { HttpStatus } from '@nestjs/common';
import {
  DomainException,
  Extension,
} from '../../../../core/exceptions/domain-exception';
import { GamePlayerAnswers } from '../../domain/game-answers.entity';
import { AnswerStatusesEnum } from '../../types/answer-status.enum';
import { GamePlayerRoleEnum } from '../../types/player-role.enum';
import { QuizGameStatusesEnum } from '../../types/quiz-game-status.enum';
import { GamePlayerAnswersRepository } from '../../infrastructure/player-answers/game-player.repository';
import { QuestionQwRepository } from '../../infrastructure/question/question-query.repository';
import { GamePlayerRepository } from '../../infrastructure/player/game-player.repository';
import { GameQwRepository } from '../../infrastructure/game/game-query.repository';
import { GameRepository } from '../../infrastructure/game/game.repository';

export class SendAnswerCommand {
  constructor(
    public dto: AnswerRequestDto,
    public userId: string,
  ) {}
}

@CommandHandler(SendAnswerCommand)
export class SendAnswerUseCase implements ICommandHandler<
  SendAnswerCommand,
  AnswerResponseDto
> {
  constructor(
    private gameQueryRepo: GameQwRepository,
    private gameRepo: GameRepository,
    private playerRepo: GamePlayerRepository,
    private questionQueryRepo: QuestionQwRepository,
    private playerAnswersRepo: GamePlayerAnswersRepository,
  ) {}
  async execute(command: SendAnswerCommand): Promise<AnswerResponseDto> {
    const userId = command.userId;
    const answer = command.dto.answer;
    // Поиск игры
    const game =
      await this.gameRepo.findCurrentGameWithPlayersAndAnswers(userId);
    if (!game) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Game Not Found', 'id')],
      });
    }

    // PendingSecondPlayer => ERROR
    if (game.status !== QuizGameStatusesEnum.Active) {
      throw new DomainException({
        code: HttpStatus.FORBIDDEN,
        message: 'Forbidden',
        extensions: [new Extension('Game Is Not Active', 'status')],
      });
    }

    // Относится ли пользователь к этой игре
    const currentPlayer = game.gamePlayer.find((p) => p.userId === userId);
    if (!currentPlayer) {
      throw new DomainException({
        code: HttpStatus.FORBIDDEN,
        message: 'Forbidden',
        extensions: [new Extension('User Is Not Participant', 'userId')],
      });
    }
    const enemyPlayer = game.gamePlayer.find((p) => p.userId !== userId);
    if (!enemyPlayer) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND, // или BAD_REQUEST
        message: 'Enemy player not found in this game',
        extensions: [new Extension('Enemy Player Not Found', 'game')],
      });
    }

    // Количество отвеченных вопросов
    const currentAnswersCount = currentPlayer.gamePlayerAnswers?.length || 0;
    const enemyAnswersCount = enemyPlayer.gamePlayerAnswers?.length || 0;
    const totalQuestions = game.questionIds?.length || 0;

    const isLastAnswered =
      currentAnswersCount === totalQuestions - 1 &&
      enemyAnswersCount === totalQuestions;

    // Поиск вопроса
    if (!game.questionIds) {
      throw new Error('ZALUPA');
    }
    const questionId = game.questionIds[currentAnswersCount];
    const question = await this.questionQueryRepo.findById(questionId);
    if (!question) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Question Not Found', 'id')],
      });
    }

    // Проверяем есть ли среди правильных ответов ответ игрока
    const status = question.correctAnswers.includes(answer)
      ? AnswerStatusesEnum.Correct
      : AnswerStatusesEnum.Incorrect;

    const playerAnswer = GamePlayerAnswers.createInstance(
      currentPlayer.id,
      question.id,
      status,
    );

    // Начать транзакцию
    const playerAnswerSaved = await this.playerAnswersRepo.save(playerAnswer);

    const answerResponse: AnswerResponseDto = {
      questionId: questionId,
      answerStatus: status,
      addedAt: playerAnswerSaved.addedAt,
    };
    return answerResponse;
  }
}
