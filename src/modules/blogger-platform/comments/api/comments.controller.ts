import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommentResponseDto } from '../dto/comment.response.dto';
import { CommentsService } from '../application/comments.service';
import {
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../user-accounts/guards/bearer/jwt-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateCommentCommand } from '../application/usecases/update-comment.usecase';
import type { Request } from 'express';
import { LikeCommentCommand } from '../application/usecases/like-comment.usecase';
import { OptionalJwtAuthGuard } from '../../../user-accounts/guards/bearer/optional-jwt-auth.guard';
import { CreateCommentRequestDto } from '../dto/create-comment.request.dto';
import { LikeRequestDto } from '../../likes/dto/like.request.dto';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(
    private commentsService: CommentsService,
    private commandBus: CommandBus,
  ) {}

  // ✅ FIND COMMENT BY ID
  @ApiOperation({ summary: 'Returns comment by id' })
  @ApiOkResponse({ type: CommentResponseDto, description: 'Success' })
  @ApiNotFoundResponse({ description: 'Comment Not Found' })
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalJwtAuthGuard)
  @Get('/:commentId')
  async getOne(
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Req() req: Request,
  ): Promise<CommentResponseDto> {
    const userInfo = req.user as { userId: string; login: string };
    return await this.commentsService.findById(commentId, userInfo.userId);
  }

  // ✅ UPDATE COMMENT
  @ApiOperation({ summary: 'Update comment by id' })
  @ApiOkResponse({ description: 'No Content' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'If try edit the comment that is not your own',
  })
  @ApiNotFoundResponse({ description: 'Comment Not Found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @Put('/:commentId')
  async update(
    @Req() req: Request,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Body() dto: CreateCommentRequestDto,
  ): Promise<void> {
    const userInfo = req.user as { userId: string; login: string };
    return await this.commandBus.execute<UpdateCommentCommand, void>(
      new UpdateCommentCommand(commentId, dto, userInfo),
    );
  }

  // ✅ DELETE COMMENT
  @ApiOperation({ summary: 'Delete comment by id' })
  @ApiOkResponse({ description: 'No Content' })
  @ApiNotFoundResponse({ description: 'Comment Not Found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @Delete('/:commentId')
  async delete(
    @Req() req: Request,
    @Param('commentId', ParseUUIDPipe) commentId: string,
  ): Promise<void> {
    const userInfo = req.user as { userId: string; login: string };
    return await this.commentsService.delete(commentId, userInfo.userId);
  }

  // ✅ LIKE/DISLIKE COMMMENT
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @Put('/:commentId/like-status')
  async likeComment(
    @Req() req: Request,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Body() dto: LikeRequestDto,
  ): Promise<void> {
    const userInfo = req.user as { userId: string; login: string };
    return await this.commandBus.execute<LikeCommentCommand, void>(
      new LikeCommentCommand(commentId, dto, userInfo),
    );
  }
}
