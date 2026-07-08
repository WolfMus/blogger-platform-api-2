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
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateUserRequestDto } from '../dto/input/create-user.request.dto';
import { UserResponseDto } from '../dto/user.response.dto';
import { UserService } from '../application/user.service';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { PaginatedUserResponseDto } from '../dto/post-paginated-view.response.dto';
import { UserPaginationRequest } from '../dto/user-pagination.request.dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../application/usecases/create-user.usecase';
import { BasicAuthGuard } from '../guards/basic/basic-auth.guard';
import { UserPostgresResponseDto } from '../infrastructure/postgresql/dto/user.response.dto';

@UseGuards(BasicAuthGuard)
@Controller('sa/users')
export class UserController {
  constructor(
    private userService: UserService,
    private commandBus: CommandBus,
  ) {}
  // ✅ GET ALL USERS
  @ApiOperation({ summary: 'Returns all users with pagination' })
  @ApiOkResponse({ type: PaginatedUserResponseDto, description: 'Success' })
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(
    @Query() pagination: UserPaginationRequest,
  ): Promise<PaginatedUserResponseDto> {
    return await this.userService.findAll(pagination);
  }

  // ✅ CREATE USER
  @ApiOperation({ summary: 'Add new user to the system' })
  @ApiCreatedResponse({
    type: UserResponseDto,
    description: 'Returns newly created user',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createUser(
    @Body() dto: CreateUserRequestDto,
  ): Promise<UserPostgresResponseDto> {
    console.log(dto);
    return await this.commandBus.execute<
      CreateUserCommand,
      UserPostgresResponseDto
    >(new CreateUserCommand(dto));
  }

  // ✅ DELETE USER
  @ApiOperation({ summary: 'Delete user from DB by id' })
  @ApiNoContentResponse({ description: 'Success' })
  @ApiNotFoundResponse({ description: 'User Not Found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/:id')
  async deleteUser(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<void> {
    return await this.userService.delete(id);
  }
}
