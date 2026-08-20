import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { User } from '../../domain/users/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SortDirection } from '../../../../core/dto/pagination.request.dto';
import { UserPaginationRequest } from '../../dto/user-pagination.request.dto';

export class UserRepository {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async save(user: User): Promise<User | null> {
    const saved = await this.userRepo.save(user);
    return saved;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userRepo.delete({ id });
    return result.affected === 1;
  }

  async findAll(
    pagination: UserPaginationRequest,
  ): Promise<{ users: User[]; totalCount: number }> {
    const sortBy = pagination.sortBy ?? 'createdAt';
    const sortDirection =
      pagination.sortDirection === SortDirection.Asc
        ? SortDirection.Asc
        : SortDirection.Desc;
    const pageNumber = pagination.pageNumber ?? 1;
    const pageSize = pagination.pageSize ?? 10;
    const offset = (pageNumber - 1) * pageSize;
    const where: FindOptionsWhere<User>[] = [];

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

  async findById(id: string): Promise<User | null> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) return null;
    return user;
  }

  async findByConfirmationCode(confirmationCode: string): Promise<User | null> {
    const user = await this.userRepo.findOne({ where: { confirmationCode } });
    if (!user) return null;
    return user;
  }

  async findByLoginAndEmail(
    login: string,
    email: string,
  ): Promise<string | null> {
    const user = await this.userRepo.findOne({
      where: [{ login: login }, { email: email }],
      relations: { session: true },
    });
    if (user && user.login === login) return 'login';
    if (user && user.email === email) return 'email';
    return null;
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<User | null> {
    const user = await this.userRepo.findOne({
      where: [{ login: loginOrEmail }, { email: loginOrEmail }],
      relations: { session: true },
    });
    return user;
  }

  async findByRecoveryCode(recoveryCode: string): Promise<User | null> {
    const user = await this.userRepo.findOne({
      where: { recoveryCode: recoveryCode },
      relations: { session: true },
    });
    return user;
  }
}
