import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PostsService } from '../application/posts.service';
import { PostResponseDto } from '../dto/post.response.dto';
import { PaginationInput } from '../../../../core/dto/pagination.request.dto';
import { PaginatedPostResponseDto } from '../dto/post-paginated-view.response.dto';
import { PaginatedCommentResponseDto } from '../../comments/dto/paginated-comment.response.dto';
import { CommentsService } from '../../comments/application/comments.service';
import { CommandBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../user-accounts/guards/bearer/jwt-auth.guard';
import { CommentResponseDto } from '../../comments/dto/comment.response.dto';
import type { Request } from 'express';
import { CreateCommentCommand } from '../../comments/application/usecases/create-comment.usecase';
import { OptionalJwtAuthGuard } from '../../../user-accounts/guards/bearer/optional-jwt-auth.guard';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { LikePostCommand } from '../application/usecases/like-post.usecase';
import { CreateCommentRequestDto } from '../../comments/dto/create-comment.request.dto';
import { LikeRequestDto } from '../../likes/dto/like.request.dto';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(
    private commandBus: CommandBus,
    private postsService: PostsService,
    private commentsService: CommentsService,
  ) {}

  // ✅ FIND POST BY ID
  @ApiOperation({ summary: 'Return blog by id' })
  @ApiOkResponse({ type: PostResponseDto, description: 'Success' })
  @ApiNotFoundResponse({ description: 'Post Not Found' })
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalJwtAuthGuard)
  @Get('/:id')
  async getPost(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<PostResponseDto> {
    const userInfo = req.user as { userId: string; login: string };
    return await this.postsService.findById(id, userInfo.userId);
  }

  // ✅ FIND ALL POSTS WITH PAGINATION
  @ApiOperation({ summary: 'Returns posts with pagination' })
  @ApiOkResponse({
    type: PaginatedPostResponseDto,
    description: 'Success',
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async getAllPosts(
    @Query() paginationInput: PaginationInput,
    @Req() req: Request,
  ): Promise<PaginatedPostResponseDto> {
    const userInfo = req.user as { userId: string; login: string };
    const posts = await this.postsService.findAll(
      paginationInput,
      userInfo.userId,
    );
    return posts;
  }

  // ❌ LIKE/DISLIKE POST
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @Put('/:postId/like-status')
  async likePost(
    @Req() req: Request,
    @Param('postId', ParseObjectIdPipe) postId: string,
    @Body() dto: LikeRequestDto,
  ): Promise<void> {
    console.log('like status - ', dto.likeStatus);
    const userInfo = req.user as { userId: string; login: string };
    return await this.commandBus.execute<LikePostCommand, void>(
      new LikePostCommand(postId, dto, userInfo),
    );
  }

  // ======== COMMENTS ========
  // ✅ GET ALL COMMENTS BY POSTID
  @ApiOperation({
    summary: 'Returns all comments for specific post with pagination',
  })
  @ApiOkResponse({
    type: PaginatedCommentResponseDto,
    description: 'Success',
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalJwtAuthGuard)
  @Get('/:postId/comments')
  async findAllForPost(
    @Query() paginationInput: PaginationInput,
    @Param('postId', ParseUUIDPipe) postId: string,
    @Req() req: Request,
  ): Promise<PaginatedCommentResponseDto> {
    const userInfo = req.user as { userId: string; login: string };
    return await this.commentsService.findAllByPostId(
      paginationInput,
      postId,
      userInfo.userId,
    );
  }

  // ✅ POST COMMENT
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @Post('/:postId/comments')
  async createComment(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Body() dto: CreateCommentRequestDto,
    @Req() req: Request,
  ): Promise<CommentResponseDto> {
    const userInfo: { userId: string; login: string } = req.user as {
      userId: string;
      login: string;
    };
    return await this.commandBus.execute<
      CreateCommentCommand,
      CommentResponseDto
    >(new CreateCommentCommand(postId, userInfo, dto));
  }
}

// CREATE POST
// @ApiOperation({ summary: 'Returns created post' })
// @ApiOkResponse({ type: PostResponseDto, description: 'Post created' })
// @HttpCode(HttpStatus.CREATED)
// @UseGuards(BasicAuthGuard)
// @Post()
// async createPost(
//   @Body() dto: CreatePostRequestDto,
// ): Promise<PostResponseDto> {
//   return this.commandBus.execute<CreatePostCommand, PostResponseDto>(
//     new CreatePostCommand(dto),
//   );
// }

// UPDATE POST BY ID
// @ApiOperation({ summary: 'Update blog by id' })
// @ApiNoContentResponse({ description: 'No Content' })
// @ApiNotFoundResponse({ description: 'Post Not Found' })
// @HttpCode(HttpStatus.NO_CONTENT)
// @UseGuards(BasicAuthGuard)
// @Put('/:id')
// async updatePost(
//   @Param('id') id: string,
//   @Body() dto: CreatePostRequestDto,
// ): Promise<void> {
//   return this.commandBus.execute<UpdatePostCommand, void>(
//     new UpdatePostCommand(dto, id),
//   );
// }

// DELETE POST
// @ApiOperation({ summary: 'Delete post by id' })
// @ApiNoContentResponse({ description: 'No content' })
// @ApiNotFoundResponse({ description: 'Post Not Found' })
// @HttpCode(HttpStatus.NO_CONTENT)
// @UseGuards(BasicAuthGuard)
// @Delete('/:id')
// async deletePost(@Param('id') id: string): Promise<void> {
//   return this.commandBus.execute<DeletePostCommand, void>(
//     new DeletePostCommand(id),
//   );
// }
