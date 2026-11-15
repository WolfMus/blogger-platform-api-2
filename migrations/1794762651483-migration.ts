import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1794762651483 implements MigrationInterface {
    name = 'Migration1794762651483'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "questions" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "questions" ADD "updatedAt" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "questions" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "questions" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
    }

}
