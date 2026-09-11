import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1789124559237 implements MigrationInterface {
    name = 'Migration1789124559237'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "likes_count"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "dislikes_count"`);
        await queryRunner.query(`ALTER TABLE "comments" ADD "likesCount" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "comments" ADD "dislikesCount" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "dislikesCount"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "likesCount"`);
        await queryRunner.query(`ALTER TABLE "comments" ADD "dislikes_count" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "comments" ADD "likes_count" integer NOT NULL DEFAULT '0'`);
    }

}
