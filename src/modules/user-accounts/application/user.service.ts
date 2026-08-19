import { HttpStatus, Injectable } from '@nestjs/common';
import { UserMapper } from '../dto/mapper/user.mapper';
import { PaginatedUserResponseDto } from '../dto/post-paginated-view.response.dto';
import { UserPaginationRequest } from '../dto/user-pagination.request.dto';
import {
  DomainException,
  Extension,
} from '../../../core/exceptions/domain-exception';
import { UserRepository } from '../infrastructure/postgresql/user.sql.repository';

@Injectable()
export class UserService {
  constructor(
    private userRepo: UserRepository,
    private userMapper: UserMapper,
  ) {}

  async findAll(
    pagination: UserPaginationRequest,
  ): Promise<PaginatedUserResponseDto> {
    const { users, totalCount } = await this.userRepo.findAll(pagination);
    return this.userMapper.toPaginatedResponseView(
      users,
      totalCount,
      pagination,
    );
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.userRepo.delete(id);
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
      userId: user.id.toString(),
    };
    return userInfo;
  }
}
