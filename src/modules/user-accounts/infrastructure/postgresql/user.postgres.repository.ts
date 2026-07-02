import { DataSource, Repository } from 'typeorm';
import { UserPostgres } from '../../domain/users/postgresql/user.postgres.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { UserPostgresResponseDto } from './dto/user.response.dto';
import { UserPaginationRequest } from '../../dto/user-pagination.request.dto';
import { SortDirection } from '../../../../core/dto/pagination.request.dto';
import { CountResponseDto } from './dto/total-count.response.dto';

export class UserPostRepository {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
    @InjectRepository(UserPostgres)
    private userRepo: Repository<UserPostgres>,
  ) {}

  async findAll(
    pagination: UserPaginationRequest,
  ): Promise<{ users: UserPostgresResponseDto[]; totalCount: number }> {
    const sortBy = pagination.sortBy ?? 'created_at';
    const sortDirection =
      pagination.sortDirection === SortDirection.Asc
        ? SortDirection.Asc
        : SortDirection.Desc;
    const pageNumber = pagination.pageNumber ?? 1;
    const pageSize = pagination.pageSize ?? 10;
    const searchLoginTerm = pagination.searchLoginTerm ?? null;
    const searchEmailTerm = pagination.searchEmailTerm ?? null;
    const offset = (pageNumber - 1) * pageSize;

    const conditions: string[] = [];
    const params: string[] = [];

    if (searchLoginTerm) {
      params.push(`%${searchLoginTerm}%`);
      conditions.push(`login ILIKE '%${params.length}%'`);
    }

    if (searchEmailTerm) {
      params.push(`%${searchEmailTerm}%`);
      conditions.push(`email ILIKE '%${params.length}%'`);
    }

    const where =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const usersQuery = `
	    SELECT id, login, email, created_at as "createdAt"
      FROM users
        ${where}
	      ORDER BY $1 ${sortDirection}
	      LIMIT $2
	      OFFSET $3;
    `;
    const usersParam = [sortBy, pageSize, offset];
    const totalQuery = `
      SELECT COUNT(*) as total_count
      FROM users
      ${where}
      `;

    const [users, totalCount] = await Promise.all([
      this.dataSource.query<UserPostgresResponseDto[]>(usersQuery, usersParam),
      this.dataSource.query<CountResponseDto[]>(totalQuery),
    ]);

    return {
      users: users,
      totalCount: Number(totalCount[0].total_count),
    };
  }

  async findById(id: number): Promise<UserPostgres | null> {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) return null;
    return user;
  }

  async isExistByLoginOrEmail(
    login: string,
    email: string,
  ): Promise<void | null> {
    const row: { exists: boolean }[] = await this.dataSource.query(
      `
      SELECT EXISTS (
		    SELECT 1
		    FROM public.users
		    WHERE login = $1 OR email = $2
	    )
    `,
      [login, email],
    );
    const isExist = row[0].exists;
    if (!isExist) return null;
    return;
  }

  // async findByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
  //   const user = await this.UserModel.findOne({
  //     $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
  //   });
  //   if (!user) return null;
  //   return user;
  // }

  // async findByConfirmationCode(code: string): Promise<UserDocument> {
  //   const user = await this.UserModel.findOne({
  //     'confirmation.confirmationCode': code,
  //   });

  //   if (!user) {
  //     throw new DomainException({
  //       code: HttpStatus.BAD_REQUEST,
  //       message: 'Not Found',
  //       extensions: [new Extension('Confirmation Code Not Found', 'code')],
  //     });
  //   }

  //   return user;
  // }

  // async findByRecoveryCode(recoveryCode: string): Promise<UserDocument> {
  //   console.log(recoveryCode);
  //   const user = await this.UserModel.findOne({
  //     'recovery.recoveryCode': recoveryCode,
  //   });

  //   if (!user) {
  //     throw new DomainException({
  //       code: HttpStatus.BAD_REQUEST,
  //       message: 'Not Found',
  //       extensions: [new Extension('Recovery Code Not Found', 'recoveryCode')],
  //     });
  //   }

  //   return user;
  // }

  // async findByEmailOrFail(email: string): Promise<UserDocument> {
  //   const user = await this.UserModel.findOne({
  //     email: email,
  //   });

  //   if (!user) {
  //     throw new DomainException({
  //       code: HttpStatus.BAD_REQUEST,
  //       message: 'Not Found',
  //       extensions: [new Extension('Confirmation Code Not Found', 'email')],
  //     });
  //   }

  //   return user;
  // }

  // async findByEmail(email: string): Promise<UserDocument | null> {
  //   const user = await this.UserModel.findOne({
  //     email: email,
  //   });

  //   return user;
  // }

  async create(user: UserPostgres): Promise<UserPostgresResponseDto> {
    const row: UserPostgresResponseDto[] = await this.dataSource.query(
      `
      INSERT INTO PUBLIC.USERS (
		    LOGIN,
		    EMAIL,
		    PASSWORD_HASH,
		    CREATED_AT,
		    IS_CONFIRMED
	    )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          TRUE
        )
        RETURNING
          id,
          login,
          email,
          created_at as "createdAt"
        ;
      `,
      [user.login, user.email, user.passwordHash, user.createdAt],
    );
    return {
      id: row[0].id,
      login: row[0].login,
      email: row[0].email,
      createdAt: row[0].createdAt,
    };
  }

  async deleteById(id: string): Promise<void | null> {
    const row = await this.dataSource.query<{ id: string }>(
      `
      DELETE 
      FROM public.users
	    WHERE id = $1
      RETURNING id;
      `,
      [id],
    );

    if (row[1] === 0) return null;
    else return;
  }
}
