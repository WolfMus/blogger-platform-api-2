import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1795609266346 implements MigrationInterface {
    name = 'Migration1795609266346'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "playerStatistic" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "sumScore" integer NOT NULL, "gamesCount" integer NOT NULL, "winsCount" integer NOT NULL, "lossesCount" integer NOT NULL, "drawsCount" integer NOT NULL, CONSTRAINT "PK_e4aefc370abf93a32c9db277669" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "playerStatistic" ADD CONSTRAINT "FK_c20d85a6b270896e623fac421c5" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "playerStatistic" DROP CONSTRAINT "FK_c20d85a6b270896e623fac421c5"`);
        await queryRunner.query(`DROP TABLE "playerStatistic"`);
    }

}
