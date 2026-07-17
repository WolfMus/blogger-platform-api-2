import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BlogsService } from '../application/blogs.service';
import { PaginationInput } from '../../../../core/dto/pagination.request.dto';
import { BlogResponseDto } from '../dto/blog-response.dto';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PostsService } from '../../posts/application/posts.service';
import { PaginatedBlogResponseDto } from '../dto/blog-paginated-view.response.dto';
import { PaginatedPostResponseDto } from '../../posts/dto/post-paginated-view.response.dto';
import { BlogPaginationRequest } from '../dto/blog-pagination.request.dto';
import { CommandBus } from '@nestjs/cqrs';
import { OptionalJwtAuthGuard } from '../../../user-accounts/guards/bearer/optional-jwt-auth.guard';
import type { Request } from 'express';

@ApiTags('Blogs')
@Controller('blogs')
export class BlogsController {
  constructor(
    private commandBus: CommandBus,
    private blogsService: BlogsService,
    private postsService: PostsService,
  ) {}

  // ✅ GET BLOG BY ID
  @ApiOperation({ summary: 'Returns blog by id' })
  @ApiOkResponse({ type: BlogResponseDto, description: 'Returns blog' })
  @ApiNotFoundResponse({ description: 'Blog not found' })
  @HttpCode(HttpStatus.OK)
  @Get('/:id')
  async getOneBlog(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BlogResponseDto> {
    return await this.blogsService.findById(id);
  }

  // ✅ GET BLOGS WITH PAGINATION
  @ApiOperation({ summary: 'Returns blogs with pagination' })
  @ApiOkResponse({ type: PaginatedBlogResponseDto, description: 'Success' })
  @HttpCode(HttpStatus.OK)
  @Get()
  async getAllBlogs(
    @Query() paginationInput: BlogPaginationRequest,
  ): Promise<PaginatedBlogResponseDto> {
    const blogs = await this.blogsService.findAll(paginationInput);
    return blogs;
  }

  // ======== POSTS ========
  // ❌ GET ALL POSTS BY BLOG ID WITH PAGINATION
  @ApiOperation({ summary: 'Returns all posts for specific blog' })
  @ApiOkResponse({
    type: PaginatedPostResponseDto,
    description: 'Success',
  })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @UseGuards(OptionalJwtAuthGuard)
  @Get('/:id/posts')
  async getAllPostsByBlogId(
    @Query() paginationInput: PaginationInput,
    @Param('id', ParseUUIDPipe) blogId: string,
    @Req() req: Request,
  ): Promise<PaginatedPostResponseDto> {
    const userInfo = req.user as { userId: string; login: string };
    await this.blogsService.findById(blogId);
    const posts = await this.postsService.findAllByBlogId(
      paginationInput,
      blogId,
      userInfo.userId,
    );
    return posts;
  }
}
