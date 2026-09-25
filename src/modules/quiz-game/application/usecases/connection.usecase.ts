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
    const userId = command.userInfo.userId;

    const isActiveGameExist = await this.gameRepo.isActiveGameExist(userId);
    if (isActiveGameExist) {
      throw new DomainException({
        code: HttpStatus.FORBIDDEN,
        message: 'Forbidden',
        extensions: [
          new Extension('Player Participating In Active Pair', 'game'),
        ],
      });
    }

    const pendingGame = await this.gameRepo.findPendingGame();

    // Создание игры
    if (!pendingGame) {
      const questions = await this.questionRepo.findQuestionsForGame();
      const questionsIds = questions.map((q) => q.id);

      const game = QuizGame.createInstance();
      game.addQuestionIds(questionsIds);
      const savedGame = await this.gameRepo.save(game);

      const player = GamePlayer.createInstance(userId);
      player.addQuizGame(savedGame);
      const savedPlayer = await this.playerRepo.save(player);

      return QuizGameMapper.toMapViewForFirstPlayer(
        savedGame,
        savedPlayer,
        questions,
      );
    }

    // Подключение к существуйющей игре
    pendingGame.changeStatus(QuizGameStatusesEnum.Active);
    const savedGame = await this.gameRepo.save(pendingGame);
    if (!savedGame.questionIds) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Player Not Found', 'id')],
      });
    }

    const questions = await this.questionRepo.findByIds(savedGame.questionIds);
    const player = GamePlayer.createInstance(userId);
    player.changeRole(GamePlayerRoleEnum.Second);
    player.addQuizGame(savedGame);
    await this.playerRepo.save(player);
    const thisPlayer = await this.playerRepo.findById(player.id);
    if (!thisPlayer) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Player Not Found', 'id')],
      });
    }

    const firstPlayer = await this.playerRepo.findByGameIdAndRole(
      savedGame.id,
      GamePlayerRoleEnum.First,
    );
    if (!firstPlayer) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('Player Not Found', 'id')],
      });
    }

    return QuizGameMapper.toMapViewForSecondPlayer(
      savedGame,
      firstPlayer,
      thisPlayer,
      questions,
    );
  }
}
