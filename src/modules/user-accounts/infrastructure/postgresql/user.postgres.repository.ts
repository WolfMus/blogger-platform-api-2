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

  private toEntity(user: UserPostgres): UserPostgres {
    return this.userRepo.create(user);
  }

  private toSnakeCase(key: string): string {
    return key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }

  async findAll(
    pagination: UserPaginationRequest,
  ): Promise<{ users: UserPostgresResponseDto[]; totalCount: number }> {
    const sortBy = pagination.sortBy ?? 'createdAt';
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
      conditions.push(`login ILIKE $${params.length}`);
    }

    if (searchEmailTerm) {
      params.push(`%${searchEmailTerm}%`);
      conditions.push(`email ILIKE $${params.length}`);
    }

    const where =
      conditions.length > 0 ? `WHERE ${conditions.join(' OR ')}` : '';

    const usersQuery = `
	    SELECT id, login, email, created_at as "createdAt"
      FROM users
        ${where}
	      ORDER BY ${this.toSnakeCase(sortBy)} ${sortDirection.toUpperCase()}
	      LIMIT $${params.length + 1}
	      OFFSET $${params.length + 2};
    `;

    const usersParam = [...params, pageSize, offset];
    const totalQuery = `
      SELECT COUNT(*) as total_count
      FROM users
      ${where}
      `;
    const totalParams = [...params];

    const [users, totalCount] = await Promise.all([
      this.dataSource.query<UserPostgresResponseDto[]>(usersQuery, usersParam),
      this.dataSource.query<CountResponseDto[]>(totalQuery, totalParams),
    ]);

    return {
      users: users,
      totalCount: Number(totalCount[0].total_count),
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

  async isExistByLoginAndEmail(
    login: string,
    email: string,
  ): Promise<string | null> {
    const row: { login: string; email: string }[] = await this.dataSource.query(
      `
		    SELECT login, email
		    FROM public.users
		    WHERE login = $1 OR email = $2
    `,
      [login, email],
    );
    if (row.length == 0) {
      return null;
    } else if (row[0].email === email) {
      return 'email';
    } else if (row[0].login === login) {
      return 'login';
    }
    return null;
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<UserPostgres | null> {
    const row: UserPostgres[] = await this.dataSource.query(
      `
        SELECT 
        id, 
        login, 
        email, 
        created_at as "createdAt", 
        updated_at as "updatedAt", 
        recovery_code as "recoveryCode", 
        recovery_code_expire_date as "recoveryCodeExpireDate", 
        is_confirmed as "isConfirmed", 
        confirmation_code as "confirmationCode", 
        confirmation_code_expire_date as "confirmationCodeExpireDate", 
        password_hash as "passwordHash"
          FROM public.users
                WHERE login LIKE $1 OR email LIKE $1;
    `,
      [loginOrEmail],
    );
    const user = row[0];
    if (!user) {
      return null;
    }
    return this.toEntity(user);
  }

  async findByRecoveryCode(recoveryCode: string): Promise<UserPostgres | null> {
    const row: UserPostgres[] = await this.dataSource.query(
      `
        SELECT 
        id, 
        login, 
        email, 
        created_at as "createdAt", 
        updated_at as "updatedAt", 
        recovery_code as "recoveryCode", 
        recovery_code_expire_date as "recoveryCodeExpireDate", 
        is_confirmed as "isConfirmed", 
        confirmation_code as "confirmationCode", 
        confirmation_code_expire_date as "confirmationCodeExpireDate", 
        password_hash as "passwordHash"
          FROM public.users
                WHERE recovery_code LIKE $1;
      `,
      [recoveryCode],
    );
    const user = row[0];
    if (!user) return null;
    return this.toEntity(user);
  }

  async findByEmail(email: string): Promise<UserPostgres | null> {
    const row = await this.dataSource.query<UserPostgres[]>(
      `
        SELECT
        id, 
        login, 
        email, 
        created_at as "createdAt", 
        updated_at as "updatedAt", 
        recovery_code as "recoveryCode", 
        recovery_code_expire_date as "recoveryCodeExpireDate", 
        is_confirmed as "isConfirmed", 
        confirmation_code as "confirmationCode", 
        confirmation_code_expire_date as "confirmationCodeExpireDate", 
        password_hash as "passwordHash"
        FROM users
        WHERE email LIKE $1;
      `,
      [email],
    );
    const user = row[0];
    if (!user) {
      return null;
    }
    return this.toEntity(user);
  }

  async save(user: UserPostgres): Promise<void> {
    await this.userRepo.save(user);
    return;
  }

  async create(user: UserPostgres): Promise<UserPostgresResponseDto> {
    const row: UserPostgresResponseDto[] = await this.dataSource.query(
      `
      INSERT INTO users (
		    login,
		    email,
		    password_hash,
		    created_at,
		    is_confirmed
	    )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          False
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
