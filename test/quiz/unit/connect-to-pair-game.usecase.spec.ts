/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import {
  ConnectToPairGameCommand,
  ConnectToPairGameUseCase,
} from '../../../src/modules/quiz-game/application/usecases/connection.usecase';
import { GamePlayerRepository } from '../../../src/modules/quiz-game/infrastructure/game-player.repository';
import { GameRepository } from '../../../src/modules/quiz-game/infrastructure/game.repository';
import { QuestionRepository } from '../../../src/modules/quiz-game/infrastructure/question.repository';
import { DomainException } from '../../../src/core/exceptions/domain-exception';
import { QuizGameMapper } from '../../../src/modules/quiz-game/dto/mapper/quiz-game.mapper';
import { QuizGame } from '../../../src/modules/quiz-game/domain/quiz-game.entity';
import { GamePlayer } from '../../../src/modules/quiz-game/domain/game-players.entity';
import { GamePlayerRoleEnum } from '../../../src/modules/quiz-game/types/player-role.enum';
import { QuizGameStatusesEnum } from '../../../src/modules/quiz-game/types/quiz-game-status.enum';

describe('ConnectToPairGameUseCase', () => {
  let useCase: ConnectToPairGameUseCase;
  let questionRepo: jest.Mocked<QuestionRepository>;
  let playerRepo: jest.Mocked<GamePlayerRepository>;
  let gameRepo: jest.Mocked<GameRepository>;

  // Создание фабрики моков для репозиториев
  const mockQuestionRepo = () => ({
    findQuestionIdsForGame: jest.fn(),
  });
  const mockPlayerRepo = () => ({
    findById: jest.fn(),
    findByUserId: jest.fn(),
    save: jest.fn(),
  });
  const mockGameRepo = () => ({
    isActiveGameExist: jest.fn(),
    findPendingGame: jest.fn(),
    save: jest.fn(),
  });

  beforeEach(async () => {
    // Когда UseCase попросит PlayerRepository, НЕ ДАВАЙ ему настоящий.
    // Дай ему нашу подделку, у которой методы — это пустышки (jest.fn())
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConnectToPairGameUseCase, // тестируемый usecase (настоящий)

        // Подсовываем моки вместо реальных репозиториев
        { provide: QuestionRepository, useFactory: mockQuestionRepo },
        { provide: GamePlayerRepository, useFactory: mockPlayerRepo },
        { provide: GameRepository, useFactory: mockGameRepo },
      ],
    }).compile();

    // Из тестового контейнера достаем экземпляры
    useCase = module.get<ConnectToPairGameUseCase>(ConnectToPairGameUseCase);
    questionRepo = module.get(QuestionRepository);
    playerRepo = module.get(GamePlayerRepository);
    gameRepo = module.get(GameRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const command = new ConnectToPairGameCommand({
      userId: 'user-id',
      login: 'john_doe',
    });

    const mockPlayer = {
      id: 'player-id',
      score: 0,
      role: GamePlayerRoleEnum.First,
      userId: 'user-id',
      quizGameId: 'game-id',
      gamePlayerAnswers: [],
      addQuizGame: jest.fn(),
    };

    it('FORBIDDEN, if has Active game', async () => {
      playerRepo.findByUserId.mockResolvedValue(mockPlayer as any);
      gameRepo.isActiveGameExist.mockResolvedValue(true);

      await expect(useCase.execute(command)).rejects.toThrow(DomainException);
    });

    it('Should create new game with status PendingGame', async () => {
      const mockQuestions = [{ id: 'q1' }, { id: 'q2' }] as any[];
      const mockSavedGame = {
        id: 'game-id',
        status: QuizGameStatusesEnum.PendingSecondPlayer,
        questionIds: mockQuestions,
        addQuestionIds: jest.fn(),
      };
      const expectedMapperResult = {
        id: 'game-id',
        status: 'PendingSecondPlayer',
      } as any;

      // Мокаем успешный путь
      playerRepo.findByUserId.mockResolvedValue(mockPlayer as any);
      gameRepo.isActiveGameExist.mockResolvedValue(false);
      gameRepo.findPendingGame.mockResolvedValue(null); // Ожидающей игры нет
      questionRepo.findQuestionIdsForGame.mockResolvedValue(mockQuestions);
      gameRepo.save.mockResolvedValue(mockSavedGame as any);
      playerRepo.save.mockResolvedValue(mockPlayer as any);
      playerRepo.findById.mockResolvedValue(mockPlayer as any);

      // Мокаем статический метод маппера, чтобы не зависимо тестировать usecase
      jest
        .spyOn(GamePlayer, 'createInstance')
        .mockReturnValue(mockPlayer as any);
      jest
        .spyOn(QuizGame, 'createInstance')
        .mockReturnValue(mockSavedGame as any);
      jest
        .spyOn(QuizGameMapper, 'toMapViewForFirstPlayer')
        .mockReturnValue(expectedMapperResult);

      const result = await useCase.execute(command);

      // Проверки
      expect(gameRepo.isActiveGameExist).toHaveBeenCalledWith('user-id');
      expect(gameRepo.findPendingGame).toHaveBeenCalled();
      expect(questionRepo.findQuestionIdsForGame).toHaveBeenCalled();
      expect(gameRepo.save).toHaveBeenCalled();
      expect(playerRepo.save).toHaveBeenCalled();
      expect(playerRepo.findById).toHaveBeenCalledWith('player-id');
      expect(result).toEqual(expectedMapperResult);
    });
  });
});

/**
 * ARRANGE
 * ACT
 * ASSERT
 */

// it('BAD_GATEWAY, if user not saved', async () => {
//   // Настраиваем поведение моков
//   // Если идет обращение к методу, то задаем что должен возвращать
//   playerRepo.findByUserId.mockResolvedValue(null);
//   playerRepo.save.mockResolvedValue(null); // Эмулируем ошибку

//   // Проверка выброса исключения
//   await expect(useCase.execute(command)).rejects.toThrow(DomainException);

//   try {
//     await useCase.execute(command);
//   } catch (error: any) {
//     expect(error.response?.code || error.code).toBe(HttpStatus.BAD_GATEWAY);
//   }
// });
