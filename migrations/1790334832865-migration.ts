import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1790334832865 implements MigrationInterface {
    name = 'Migration1790334832865'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "gamePlayerAnswers" DROP CONSTRAINT "FK_97a4777d3de53cbefe8159043eb"`);
        await queryRunner.query(`ALTER TABLE "gamePlayers" DROP CONSTRAINT "FK_03b7d3d7a27e2b092eca82e273a"`);
        await queryRunner.query(`ALTER TABLE "gamePlayerAnswers" ADD CONSTRAINT "FK_97a4777d3de53cbefe8159043eb" FOREIGN KEY ("gamePlayerId") REFERENCES "gamePlayers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gamePlayers" ADD CONSTRAINT "FK_03b7d3d7a27e2b092eca82e273a" FOREIGN KEY ("quizGameId") REFERENCES "quizGames"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "gamePlayers" DROP CONSTRAINT "FK_03b7d3d7a27e2b092eca82e273a"`);
        await queryRunner.query(`ALTER TABLE "gamePlayerAnswers" DROP CONSTRAINT "FK_97a4777d3de53cbefe8159043eb"`);
        await queryRunner.query(`ALTER TABLE "gamePlayers" ADD CONSTRAINT "FK_03b7d3d7a27e2b092eca82e273a" FOREIGN KEY ("quizGameId") REFERENCES "quizGames"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gamePlayerAnswers" ADD CONSTRAINT "FK_97a4777d3de53cbefe8159043eb" FOREIGN KEY ("gamePlayerId") REFERENCES "gamePlayers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
