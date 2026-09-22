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
import { HttpStatus } from '@nestjs/common';
import { QuizGameMapper } from '../../../src/modules/quiz-game/dto/mapper/quiz-game.mapper';

describe('ConnectToPairGameUseCase', () => {
  let useCase: ConnectToPairGameUseCase;
  let questionRepo: jest.Mocked<QuestionRepository>;
  let playerRepo: jest.Mocked<GamePlayerRepository>;
  let gameRepo: jest.Mocked<GameRepository>;

  // Создание фабрики моков для репозиториев
  const mockQuestionRepo = () => ({
    findQuestionsForGame: jest.fn(),
  });
  const mockPlayerRepo = () => ({
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
      userId: 'user-id-123',
      login: 'john_doe',
    });

    const mockPlayer = { id: 'player-id-123', userId: 'user-id-123' };

    it('BAD_GATEWAY, if user not saved', async () => {
      // Настраиваем поведение моков
      // Если идет обращение к методу, то задаем что должен возвращать
      playerRepo.findByUserId.mockResolvedValue(null);
      playerRepo.save.mockResolvedValue(null); // Эмулируем ошибку

      // Проверка выброса исключения
      await expect(useCase.execute(command)).rejects.toThrow(DomainException);

      try {
        await useCase.execute(command);
      } catch (error: any) {
        expect(error.response?.code || error.code).toBe(HttpStatus.BAD_GATEWAY);
      }
    });

    it('FORBIDDEN, if has Active game', async () => {
      playerRepo.findByUserId.mockResolvedValue(mockPlayer as any);
      gameRepo.isActiveGameExist.mockResolvedValue(true);

      await expect(useCase.execute(command)).rejects.toThrow(DomainException);
    });

    it('Should create new game with status PendingGame', async () => {
      const mockQuestions = [{ id: 'q1' }, { id: 'q2' }] as any[];
      const mockSavedGame = { id: 'game-id-123', addQuestionIds: jest.fn() };
      const expectedMapperResult = {
        id: 'game-id-123',
        status: 'PendingSecondPlayer',
      } as any;

      // Мокаем успешный путь
      playerRepo.findByUserId.mockResolvedValue(mockPlayer as any);
      gameRepo.isActiveGameExist.mockResolvedValue(false);
      gameRepo.findPendingGame.mockResolvedValue(null); // Ожидающей игры нет
      questionRepo.findQuestionsForGame.mockResolvedValue(mockQuestions);
      gameRepo.save.mockResolvedValue(mockSavedGame as any);

      // Мокаем статический метод маппера, чтобы не зависимо тестировать usecase
      jest
        .spyOn(QuizGameMapper, 'toMapView')
        .mockReturnValue(expectedMapperResult);

      const result = await useCase.execute(command);

      // Проверки
      expect(playerRepo.findByUserId).toHaveBeenCalledWith('user-id-123');
      expect(gameRepo.isActiveGameExist).toHaveBeenCalledWith('player-id-123');
      expect(gameRepo.findPendingGame).toHaveBeenCalled();
      expect(questionRepo.findQuestionsForGame).toHaveBeenCalled();
      expect(gameRepo.save).toHaveBeenCalled();
      expect(result).toEqual(expectedMapperResult);
    });
  });
});

/**
 * ARRANGE
 * ACT
 * ASSERT
 */
