import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionRepository } from '../../infrastructure/question.repository';
import { GamePlayerRepository } from '../../infrastructure/game-player.repository';
import { GamePlayer } from '../../domain/game-players.entity';
import {
  DomainException,
  Extension,
} from '../../../../core/exceptions/domain-exception';
import { HttpStatus } from '@nestjs/common';
import { GameRepository } from '../../infrastructure/game.repository';
import { QuizGame } from '../../domain/quiz-game.entity';
import { QuizGameMapper } from '../../dto/mapper/quiz-game.mapper';
import { GameResponseDto } from '../../dto/game-response.dto';
import { QuizGameStatusesEnum } from '../../types/quiz-game-status.enum';
import { QuestionResponseType } from '../../types/question-response.type';
import { GamePlayerRoleEnum } from '../../types/player-role.enum';

export class ConnectToPairGameCommand {
  constructor(public userInfo: { userId: string; login: string }) {}
}

@CommandHandler(ConnectToPairGameCommand)
export class ConnectToPairGameUseCase implements ICommandHandler<ConnectToPairGameCommand> {
  constructor(
    private questionRepo: QuestionRepository,
    private playerRepo: GamePlayerRepository,
    private gameRepo: GameRepository,
  ) {}
  async execute(
    command: ConnectToPairGameCommand,
  ): Promise<GameResponseDto | null> {
    // JWT пропустил пользователя = Он существует
    const userId = command.userInfo.userId;

    // Создаем игрока
    let player: GamePlayer;
    player = GamePlayer.createInstance(userId);

    // Проверяем есть ли НЕЗАВЕРШЕННЫЕ игры
    const isActiveGameExist = await this.gameRepo.isActiveGameExist(userId);
    if (isActiveGameExist) {
      throw new DomainException({
        code: HttpStatus.FORBIDDEN,
        message: 'Forbidden',
        extensions: [
          new Extension('Player Participatin In Active Pair', 'game'),
        ],
      });
    }

    // Поиск комнаты со статусом PendingSecondPlayer
    const pendingGame = await this.gameRepo.findPendingGame();

    let game: QuizGame;
    let questions: QuestionResponseType[];
    // Если игры нет => Создаем
    // Если есть => Подключаем
    if (!pendingGame) {
      // Выбираем 5 случайных вопросов для игры
      questions = await this.questionRepo.findQuestionIdsForGame();
      const questionsIds = questions.map((q) => q.id);
      // Создаем instance
      game = QuizGame.createInstance();
      // Добавляем вопросы в gameInstance
      game.addQuestionIds(questionsIds);
      game = await this.gameRepo.save(game);
      // Добавляем игру игроку
      player.addQuizGame(game);
      player = await this.playerRepo.save(player);
      const thisPlayer = await this.playerRepo.findById(player.id);
      if (!thisPlayer) {
        throw new DomainException({
          code: HttpStatus.NOT_FOUND,
          message: 'Not Found',
          extensions: [new Extension('Player Not Found', 'id')],
        });
      }

      return QuizGameMapper.toMapViewForFirstPlayer(
        game,
        thisPlayer,
        questions,
      );
    } else {
      // Меняем статус игры
      pendingGame.changeStatus(QuizGameStatusesEnum.Active);
      game = await this.gameRepo.save(pendingGame);
      const thisGame = await this.gameRepo.findById(game.id);
      if (!thisGame) {
        throw new DomainException({
          code: HttpStatus.NOT_FOUND,
          message: 'Not Found',
          extensions: [new Extension('Player Not Found', 'id')],
        });
      }

      // Поиск вопросов
      if (!game.questionIds) {
        throw new DomainException({
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Game has no questions',
        });
      }
      questions = await this.questionRepo.findByIds(game.questionIds);
      player.changeRole(GamePlayerRoleEnum.Second);

      // Добавляем игру игроку
      player.addQuizGame(game);
      player = await this.playerRepo.save(player);
      const thisPlayer = await this.playerRepo.findById(player.id);
      if (!thisPlayer) {
        throw new DomainException({
          code: HttpStatus.NOT_FOUND,
          message: 'Not Found',
          extensions: [new Extension('Player Not Found', 'id')],
        });
      }

      // Ищем первого игрока
      const firstPlayerId = thisGame.gamePlayer.find(
        (p) => p.role === GamePlayerRoleEnum.First,
      )?.id;
      const firstPlayer = await this.playerRepo.findById(firstPlayerId!);
      if (!firstPlayer) {
        throw new DomainException({
          code: HttpStatus.NOT_FOUND,
          message: 'Not Found',
          extensions: [new Extension('Player Not Found', 'id')],
        });
      }

      return QuizGameMapper.toMapViewForSecondPlayer(
        thisGame,
        firstPlayer,
        thisPlayer,
        questions,
      );
    }
  }
}
