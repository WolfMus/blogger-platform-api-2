import { ApiProperty } from '@nestjs/swagger';
import { Pagination } from '../../../../core/dto/pagination.dto';
import { QuizGameReadModel } from './game.read-model';
import { GameResponseDto } from './game-response.dto';

export class QuizGamePaginatedResponseDto extends Pagination {
  @ApiProperty({ type: [QuizGameReadModel] })
  items: GameResponseDto[];
}
