import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1790255080136 implements MigrationInterface {
    name = 'Migration1790255080136'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."gamePlayers_role_enum" AS ENUM('First', 'Second')`);
        await queryRunner.query(`ALTER TABLE "gamePlayers" ADD "role" "public"."gamePlayers_role_enum" NOT NULL DEFAULT 'First'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "gamePlayers" DROP COLUMN "role"`);
        await queryRunner.query(`DROP TYPE "public"."gamePlayers_role_enum"`);
    }

}
