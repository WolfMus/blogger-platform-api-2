import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionRepository } from '../../infrastructure/question.repository';
import { UserRepository } from '../../../user-accounts/infrastructure/users/user.repository';
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

export class ConnectToPairGameCommand {
  constructor(public userInfo: { userId: string; login: string }) {}
}

@CommandHandler(ConnectToPairGameCommand)
export class ConnectToPairGameUseCase implements ICommandHandler<ConnectToPairGameCommand> {
  constructor(
    private questionRepo: QuestionRepository,
    private playerRepo: GamePlayerRepository,
    private userRepo: UserRepository,
    private gameRepo: GameRepository,
  ) {}
  async execute(command: ConnectToPairGameCommand): Promise<any> {
    // JWT пропустил пользователя = Он существует
    const userId = command.userInfo.userId;

    // Ищем игрока по userId
    // Игрока не существует => Создаем
    let player = await this.playerRepo.findByUserId(userId);
    if (!player) {
      const newPlayer = GamePlayer.createInstance(userId);
      player = await this.playerRepo.save(newPlayer);
      if (!player) {
        throw new DomainException({
          code: HttpStatus.BAD_GATEWAY,
          message: 'BAD_GATEWAY',
          extensions: [new Extension('Player Not Saved', 'player')],
        });
      }
    }

    // Проверяем есть ли НЕЗАВЕРШЕННЫЕ игры
    const isActiveGameExist = await this.gameRepo.isActiveGameExist(player.id);
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

    // Если игры нет => Создаем
    // Если есть => Подключаем
    if (!pendingGame) {
      // Создаем instance
      const newGame = QuizGame.createInstance();

      // Выбираем 5 случайных вопросов для игры
      const questions = await this.questionRepo.findQuestionsForGame();
      const questionsIds = questions.map((q) => q.id);

      // Добавляем вопросы в gameInstance
      newGame.addQuestionIds(questionsIds);
      // Сохраняем
      const newGameSaved = await this.gameRepo.save(newGame);
      if (!newGameSaved) {
        throw new DomainException({
          code: HttpStatus.BAD_GATEWAY,
          message: 'BAD_GATEWAY',
          extensions: [new Extension('Game Not Saved', 'game')],
        });
      }
      // Возвращаем ответ
      return QuizGameMapper.toMapView(newGameSaved, player, questions);
    } // else {}
  }
}
