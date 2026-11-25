import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1795612537324 implements MigrationInterface {
    name = 'Migration1795612537324'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "playerStatistic" ADD "avgScores" numeric(3,2) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "playerStatistic" DROP COLUMN "avgScores"`);
    }

}
