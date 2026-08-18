import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { UserPostgres } from '../../domain/users/postgresql/user.postgres.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserPaginationRequest } from '../../dto/user-pagination.request.dto';
import { SortDirection } from '../../../../core/dto/pagination.request.dto';

export class UserPostRepository {
  constructor(
    @InjectRepository(UserPostgres)
    private userRepo: Repository<UserPostgres>,
  ) {}

  async save(user: UserPostgres): Promise<UserPostgres | null> {
    const saved = await this.userRepo.save(user);
    return saved;
  }

  async delete(id: string): Promise<void | null> {
    const deleted = await this.userRepo.delete({ id: id });
    if (!deleted) {
      return null;
    }
    return;
  }

  async findAll(pagination: UserPaginationRequest) {
    const sortBy = pagination.sortBy ?? 'createdAt';
    const sortDirection =
      pagination.sortDirection === SortDirection.Asc
        ? SortDirection.Asc
        : SortDirection.Desc;
    const pageNumber = pagination.pageNumber ?? 1;
    const pageSize = pagination.pageSize ?? 10;
    const offset = (pageNumber - 1) * pageSize;
    const where: FindOptionsWhere<UserPostgres>[] = [];

    if (pagination.searchLoginTerm) {
      where.push({
        login: ILike(`%${pagination.searchLoginTerm}%`),
      });
    }

    if (pagination.searchEmailTerm) {
      where.push({
        email: ILike(`%${pagination.searchEmailTerm}%`),
      });
    }

    const [users, totalCount] = await this.userRepo.findAndCount({
      where: where.length > 0 ? where : undefined,
      order: { [sortBy]: sortDirection },
      skip: offset,
      take: pageSize,
    });

    return {
      users: users,
      totalCount: totalCount,
    };
  }

  async findById(id: string): Promise<UserPostgres | null> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) return null;
    return user;
  }

  async findByConfirmationCode(
    confirmationCode: string,
  ): Promise<UserPostgres | null> {
    const user = await this.userRepo.findOne({ where: { confirmationCode } });
    if (!user) return null;
    return user;
  }

  async findByLoginAndEmail(
    login: string,
    email: string,
  ): Promise<UserPostgres | null> {
    const user = await this.userRepo.findOne({
      where: { login: login, email: email },
      relations: { session: true },
    });
    return user;
  }

  async findByLoginOrEmail(
    login: string,
    email: string,
  ): Promise<UserPostgres | null> {
    const user = await this.userRepo.findOne({
      where: [{ login: login }, { email: email }],
      relations: { session: true },
    });
    return user;
  }

  async findByRecoveryCode(recoveryCode: string): Promise<UserPostgres | null> {
    const user = await this.userRepo.findOne({
      where: { recoveryCode: recoveryCode },
      relations: { session: true },
    });
    return user;
  }
}
