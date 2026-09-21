import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateQuestionDto } from '../dto/create-question.dto';
import { BasicAuthGuard } from '../../user-accounts/guards/basic/basic-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { CreateQuestionCommand } from '../application/usecases/create-question.usecase';
import { QuestionViewModel } from '../dto/question-view-model';
import { UpdateQuestionCommand } from '../application/usecases/update-question.usecase';
import { DeleteQuestionCommand } from '../application/usecases/delete-question.usecase';
import { PublishQuestionDto } from '../dto/question-publish.dto';
import { PublishQuestionCommand } from '../application/usecases/publish-question.usecase';
import { QuestionPaginationInput } from '../types/question-pagination-input.type';
import { FindAllQuestionsCommand } from '../application/usecases/find-all-question.usecase';

@Controller('sa/quiz/questions')
export class QuizGameController {
  constructor(private commandBus: CommandBus) {}

  // Get questions
  @HttpCode(HttpStatus.OK)
  @UseGuards(BasicAuthGuard)
  @Get()
  async findAllQuestions(@Query() paginationInput: QuestionPaginationInput) {
    return await this.commandBus.execute<
      FindAllQuestionsCommand,
      QuestionViewModel
    >(new FindAllQuestionsCommand(paginationInput));
  }

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
    @Param('id', ParseUUIDPipe) id: string,
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
  async deleteQuestion(@Param('id', ParseUUIDPipe) id: string) {
    return await this.commandBus.execute<DeleteQuestionCommand, void>(
      new DeleteQuestionCommand(id),
    );
  }

  // Publish/unpublish question
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  @Put('/:id/publish')
  async publishQuestion(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PublishQuestionDto,
  ) {
    return await this.commandBus.execute<PublishQuestionCommand, void>(
      new PublishQuestionCommand(id, dto),
    );
  }
}
