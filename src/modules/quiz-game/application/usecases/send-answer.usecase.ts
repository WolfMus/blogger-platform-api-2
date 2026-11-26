import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';
import {
  DomainException,
  Extension,
} from '../../../../core/exceptions/domain-exception';
import { GamePlayerAnswers } from '../../domain/game-answers.entity';
import { AnswerStatusesEnum } from '../../types/answer-status.enum';
import { QuizGameStatusesEnum } from '../../types/quiz-game-status.enum';
import { GamePlayerAnswersRepository } from '../../infrastructure/player-answers/game-player.repository';
import { QuestionQwRepository } from '../../infrastructure/question/question-query.repository';
import { GamePlayerRepository } from '../../infrastructure/player/game-player.repository';
import { GameRepository } from '../../infrastructure/game/game.repository';
import { AnswerResponseDto } from '../../dto/answer/answer-response.dto';
import { AnswerRequestDto } from '../../dto/answer/answer-request.dto';
import { QuizGameService } from '../quiz-game.service';
import { PlayerStatisticService } from '../../player-statistic/application/player-statistic.service';

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
    private gameRepo: GameRepository,
    private gameService: QuizGameService,
    private playerRepo: GamePlayerRepository,
    private questionQueryRepo: QuestionQwRepository,
    private playerAnswersRepo: GamePlayerAnswersRepository,
    private playerStatisticService: PlayerStatisticService,
  ) {}
  async execute(command: SendAnswerCommand): Promise<AnswerResponseDto> {
    const userId = command.userId;
    const answer = command.dto.answer;
    // Поиск игры
    const game =
      await this.gameRepo.findCurrentGameWithPlayersAndAnswers(userId);
    if (!game) {
      throw new DomainException({
        code: HttpStatus.FORBIDDEN,
        message: 'Not Found',
        extensions: [
          new Extension('User Is Not Participating In Active Pair', 'userId'),
        ],
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
    if (currentAnswersCount === totalQuestions) {
      throw new DomainException({
        code: HttpStatus.FORBIDDEN,
        message: 'Forbidden',
        extensions: [
          new Extension('Already answered to all questions', 'questionIds'),
        ],
      });
    }

    // Поиск вопроса
    const questionId = game.questionIds![currentAnswersCount];
    const question = await this.questionQueryRepo.findById(questionId);
    if (!question) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Question Not Found', 'id')],
      });
    }

    // Проверяем есть ли среди правильных ответов ответ игрока
    const answerStatus = question.correctAnswers.includes(answer)
      ? AnswerStatusesEnum.Correct
      : AnswerStatusesEnum.Incorrect;

    // Добавляем очко за правильный ответ
    if (answerStatus === AnswerStatusesEnum.Correct) {
      currentPlayer.addScore();
    }
    await this.playerRepo.save(currentPlayer);

    // Сохранение ответа
    const playerAnswer = GamePlayerAnswers.createInstance(
      currentPlayer.id,
      question.id,
      answerStatus,
    );
    const playerAnswerSaved = await this.playerAnswersRepo.save(playerAnswer);

    // Закончилась ли игра
    const isGameFinishing =
      currentAnswersCount === totalQuestions - 1 &&
      enemyAnswersCount === totalQuestions;
    if (isGameFinishing) {
      game.changeStatus(QuizGameStatusesEnum.Finished);
      await this.gameRepo.save(game);
      await this.gameService.awardBonusForFirstCompletion(game.id);
      await this.playerStatisticService.updateStatisticAfterGameFinished(
        game.id,
      );
    }

    const answerResponse: AnswerResponseDto = {
      questionId: questionId,
      answerStatus: answerStatus,
      addedAt: playerAnswerSaved.addedAt,
    };
    return answerResponse;
  }
}
