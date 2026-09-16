import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { QuizGameService } from '../application/quiz-game.service';
import { CreateQuestionDto } from '../dto/create-question.dto';
import { BasicAuthGuard } from '../../user-accounts/guards/basic/basic-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { CreateQuestionCommand } from '../application/usecases/create-question.usecase';
import { QuestionViewModel } from '../dto/question-view-model';
import { UpdateQuestionCommand } from '../application/usecases/update-question.usecase';
import { DeleteQuestionCommand } from '../application/usecases/delete-question.usecase';
import { PublishQuestionDto } from '../dto/publish.dto';
import { PublishQuestionCommand } from '../application/usecases/publish-question.usecase';

@Controller('sa/quiz/questions')
export class QuizGameController {
  constructor(
    private quizGameService: QuizGameService,
    private commandBus: CommandBus,
  ) {}

  // Create question
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(BasicAuthGuard)
  @Post()
  async create(@Body() dto: CreateQuestionDto) {
    return await this.commandBus.execute<
      CreateQuestionCommand,
      QuestionViewModel
    >(new CreateQuestionCommand(dto));
  }

  // Update question
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  @Put('/:id')
  async updateQuestion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateQuestionDto,
  ) {
    return await this.commandBus.execute<UpdateQuestionCommand, void>(
      new UpdateQuestionCommand(id, dto),
    );
  }

  // Delete question
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  @Delete('/:id')
  async deleteQuestion(@Param('id', ParseIntPipe) id: number) {
    return await this.commandBus.execute<DeleteQuestionCommand, void>(
      new DeleteQuestionCommand(id),
    );
  }

  // Publish/unpublish question
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  @Put('/:id/publish')
  async publishQuestion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PublishQuestionDto,
  ) {
    return await this.commandBus.execute<PublishQuestionCommand, void>(
      new PublishQuestionCommand(id, dto),
    );
  }
}
