import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1789991350497 implements MigrationInterface {
    name = 'Migration1789991350497'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "gamePlayers" DROP CONSTRAINT "FK_e3ab17bd53416b4705522880503"`);
        await queryRunner.query(`ALTER TABLE "gamePlayers" DROP COLUMN "gameId"`);
        await queryRunner.query(`ALTER TABLE "gamePlayers" ADD "quizGameId" uuid`);
        await queryRunner.query(`ALTER TABLE "gamePlayers" DROP CONSTRAINT "FK_abf88448d7c61c70366c122c7c4"`);
        await queryRunner.query(`ALTER TABLE "gamePlayers" ALTER COLUMN "userId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "gamePlayers" ADD CONSTRAINT "FK_abf88448d7c61c70366c122c7c4" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gamePlayers" ADD CONSTRAINT "FK_03b7d3d7a27e2b092eca82e273a" FOREIGN KEY ("quizGameId") REFERENCES "quizGames"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "gamePlayers" DROP CONSTRAINT "FK_03b7d3d7a27e2b092eca82e273a"`);
        await queryRunner.query(`ALTER TABLE "gamePlayers" DROP CONSTRAINT "FK_abf88448d7c61c70366c122c7c4"`);
        await queryRunner.query(`ALTER TABLE "gamePlayers" ALTER COLUMN "userId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "gamePlayers" ADD CONSTRAINT "FK_abf88448d7c61c70366c122c7c4" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gamePlayers" DROP COLUMN "quizGameId"`);
        await queryRunner.query(`ALTER TABLE "gamePlayers" ADD "gameId" uuid`);
        await queryRunner.query(`ALTER TABLE "gamePlayers" ADD CONSTRAINT "FK_e3ab17bd53416b4705522880503" FOREIGN KEY ("gameId") REFERENCES "quizGames"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
