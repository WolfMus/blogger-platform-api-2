import { HttpStatus, Injectable } from '@nestjs/common';
import { GameQwRepository } from '../infrastructure/game/game-query.repository';
import {
  DomainException,
  Extension,
} from '../../../core/exceptions/domain-exception';
import { GameResponseDto } from '../dto/game-response.dto';
import { QuizGameStatusesEnum } from '../types/quiz-game-status.enum';
import { GamePlayerRepository } from '../infrastructure/player/game-player.repository';
import { GamePlayerAnswers } from '../domain/game-answers.entity';
import { QuestionQwRepository } from '../infrastructure/question/question-query.repository';
import { AnswerStatusesEnum } from '../types/answer-status.enum';
import { GamePlayerAnswersRepository } from '../infrastructure/player-answers/game-player.repository';
import { AnswerResponseDto } from '../dto/answer-response.dto';

@Injectable()
export class QuizGameService {
  constructor(
    private gameQueryRepo: GameQwRepository,
    private playerRepo: GamePlayerRepository,
    private questionQueryRepo: QuestionQwRepository,
    private playerAnswersRepo: GamePlayerAnswersRepository,
  ) {}

  async findById(id: string, userId: string): Promise<GameResponseDto> {
    // Получаем game
    const game = await this.gameQueryRepo.findById(id);
    if (!game) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Game Not Found', 'id')],
      });
    }

    // Относится ли пользователь к этой игре
    const firstPlayerId = game.firstPlayerProgress.player.id;
    const secondPlayerId = game.secondPlayerProgress?.player.id;
    if (firstPlayerId !== userId && secondPlayerId !== userId) {
      throw new DomainException({
        code: HttpStatus.FORBIDDEN,
        message: 'Forbidden',
        extensions: [new Extension('User Is Not Participant', 'userId')],
      });
    }

    return game;
  }

  async findCurrentGame(userId: string): Promise<GameResponseDto> {
    const game = await this.gameQueryRepo.findCurrentGame(userId);
    if (!game) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Game Not Found', 'id')],
      });
    }
    return game;
  }

  async sendAnswer(userId: string, answer: string): Promise<AnswerResponseDto> {
    // Поиск игры
    const game = await this.gameQueryRepo.findCurrentGame(userId);
    if (!game) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Game Not Found', 'id')],
      });
    }

    // Игра в статусе ACTIVE?
    if (game.status !== QuizGameStatusesEnum.Active) {
      throw new DomainException({
        code: HttpStatus.FORBIDDEN,
        message: 'Forbidden',
        extensions: [new Extension('Game Is Not Active', 'status')],
      });
    }

    // Относится ли пользователь к этой игре
    const firstPlayerId = game.firstPlayerProgress.player.id;
    const secondPlayerId = game.secondPlayerProgress?.player.id;
    if (firstPlayerId !== userId && secondPlayerId !== userId) {
      throw new DomainException({
        code: HttpStatus.FORBIDDEN,
        message: 'Forbidden',
        extensions: [new Extension('User Is Not Participant', 'userId')],
      });
    }

    // Ищем пользователя по gameId & userId
    const player = await this.playerRepo.findByUserIdAndGameId(userId, game.id);
    if (!player) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Player Not Found', 'id')],
      });
    }

    // Количество отвеченных вопросов
    const answersCount = player.gamePlayerAnswers.length;
    if (answersCount === 5) {
      throw new DomainException({
        code: HttpStatus.FORBIDDEN,
        message: 'Forbidden',
        extensions: [
          new Extension('All questions already answered', 'questionId'),
        ],
      });
    }
    // Поиск вопроса
    const questionId = game.questions[answersCount].id;
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

    // Сохраняем вопрос
    const playerAnswer = GamePlayerAnswers.createInstance(
      player.id,
      question.id,
      status,
    );
    const playerAnswerSaved = await this.playerAnswersRepo.save(playerAnswer);

    const answerResponse: AnswerResponseDto = {
      questionId: questionId,
      answerStatus: status,
      addedAt: playerAnswerSaved.addedAt,
    };
    return answerResponse;
  }
}

/**
 *         403
 * user not PARTICIPANT
 * user not in ACTIVE pair
 * user ANSWERED ALL QUESTIONS
 */
