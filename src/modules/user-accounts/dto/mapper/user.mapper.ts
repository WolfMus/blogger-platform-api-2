import { UserPaginationRequest } from '../user-pagination.request.dto';
import { UserResponseDto } from '../user.response.dto';

export class UserMapper {
  toResponseView(user: UserResponseDto): UserResponseDto {
    return {
      id: user.id.toString(),
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  toPaginatedResponseView(
    users: UserResponseDto[],
    totalCount: number,
    pagination: UserPaginationRequest,
  ) {
    const pageNumber = pagination.pageNumber ?? 1;
    const pageSize = pagination.pageSize ?? 10;
    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: totalCount,
      items: users.map((user) => this.toResponseView(user)),
    };
  }
}
