import { InjectModel } from '@nestjs/mongoose';
import {
  User,
  type UserDocument,
  type UserModelType,
} from '../domain/users/mongo/user.entity';
import { UserPaginationRequest } from '../dto/user-pagination.request.dto';
import { SortDirection } from '../../../core/dto/pagination.request.dto';
import { UserResponseDto } from '../dto/user.response.dto';
import { HttpStatus } from '@nestjs/common';
import {
  DomainException,
  Extension,
} from '../../../core/exceptions/domain-exception';
import { UserMapper } from '../dto/mapper/user.mapper';

export class UserQwRepository {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private userMapper: UserMapper,
  ) {}

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.UserModel.findById(id);
    if (!user) {
      throw new DomainException({
        code: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        extensions: [new Extension('User Not Found', 'id')],
      });
    }
    return this.userMapper.toResponseView(user);
  }

  async findAll(pagination: UserPaginationRequest): Promise<{
    users: UserDocument[];
    totalCount: number;
  }> {
    const sortBy = pagination.sortBy ?? 'createdAt';
    const sortDirection =
      pagination.sortDirection === SortDirection.Asc ? 1 : -1;
    const pageNumber = pagination.pageNumber ?? 1;
    const pageSize = pagination.pageSize ?? 10;
    const searchLoginTerm = pagination.searchLoginTerm ?? null;
    const searchEmailTerm = pagination.searchEmailTerm ?? null;

    const filter: Record<string, any> = {};
    if (searchLoginTerm && searchEmailTerm) {
      filter.$or = [
        { login: { $regex: searchLoginTerm, $options: 'i' } },
        { email: { $regex: searchEmailTerm, $options: 'i' } },
      ];
    } else {
      if (searchLoginTerm) {
        filter.login = { $regex: searchLoginTerm, $options: 'i' };
      }
      if (searchEmailTerm) {
        filter.email = { $regex: searchEmailTerm, $options: 'i' };
      }
    }

    const skip = (pageNumber - 1) * pageSize;
    const users = await this.UserModel.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize);

    const totalCount = await this.UserModel.countDocuments(filter);

    return { users, totalCount };
  }
}
