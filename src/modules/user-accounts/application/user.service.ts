import { HttpStatus, Injectable } from '@nestjs/common';
import { UserRepository } from '../infrastructure/user.repository';
import { UserMapper } from '../dto/mapper/user.mapper';
import { PaginatedUserResponseDto } from '../dto/post-paginated-view.response.dto';
import { UserPaginationRequest } from '../dto/user-pagination.request.dto';
import { UserQwRepository } from '../infrastructure/user-query.repository';
import {
  DomainException,
  Extension,
} from '../../../core/exceptions/domain-exception';
import { UserPostRepository } from '../infrastructure/postgresql/user.postgres.repository';

@Injectable()
export class UserService {
  constructor(
    private userPostgresRepo: UserPostRepository,
    private userRepo: UserRepository,
    private userQueryRepo: UserQwRepository,
    private userMapper: UserMapper,
  ) {}

  async findAll(
    pagination: UserPaginationRequest,
  ): Promise<PaginatedUserResponseDto> {
    const { users, totalCount } =
      await this.userPostgresRepo.findAll(pagination);
    return this.userMapper.toPaginatedResponseView(
      users,
      totalCount,
      pagination,
    );
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.userPostgresRepo.deleteById(id);
    if (deleted === null) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('User Not Found', 'id')],
      });
    }
    return;
  }

  async getMeInfo(userId: string): Promise<{
    email: string;
    login: string;
    userId: string;
  }> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('User Not Found', 'id')],
      });
    }
    const userInfo = {
      email: user.email,
      login: user.login,
      userId: user._id.toString(),
    };
    return userInfo;
  }
}
