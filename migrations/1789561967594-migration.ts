import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1789561967594 implements MigrationInterface {
    name = 'Migration1789561967594'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "questions" DROP CONSTRAINT "PK_08a6d4b0f49ff300bf3a0ca60ac"`);
        await queryRunner.query(`ALTER TABLE "questions" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "questions" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "questions" ADD CONSTRAINT "PK_08a6d4b0f49ff300bf3a0ca60ac" PRIMARY KEY ("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "questions" DROP CONSTRAINT "PK_08a6d4b0f49ff300bf3a0ca60ac"`);
        await queryRunner.query(`ALTER TABLE "questions" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "questions" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "questions" ADD CONSTRAINT "PK_08a6d4b0f49ff300bf3a0ca60ac" PRIMARY KEY ("id")`);
    }

}
