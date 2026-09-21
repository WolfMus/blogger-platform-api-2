import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1789904474347 implements MigrationInterface {
    name = 'Migration1789904474347'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "gamePlayers" DROP CONSTRAINT "FK_8ccb1b7edf5dd41de7fcd960146"`);
        await queryRunner.query(`ALTER TABLE "gamePlayers" DROP CONSTRAINT "FK_9f5390391303ad9c1e7c6f1960d"`);
        await queryRunner.query(`ALTER TABLE "gamePlayers" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "gamePlayers" DROP COLUMN "game_id"`);
        await queryRunner.query(`ALTER TABLE "gamePlayers" ADD "userId" uuid`);
        await queryRunner.query(`ALTER TABLE "gamePlayers" ADD "gameId" uuid`);
        await queryRunner.query(`ALTER TABLE "gamePlayerAnswers" DROP CONSTRAINT "FK_97a4777d3de53cbefe8159043eb"`);
        await queryRunner.query(`ALTER TABLE "gamePlayerAnswers" ALTER COLUMN "gamePlayerId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "gamePlayerAnswers" DROP COLUMN "questionId"`);
        await queryRunner.query(`ALTER TABLE "gamePlayerAnswers" ADD "questionId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "gamePlayerAnswers" ADD CONSTRAINT "FK_97a4777d3de53cbefe8159043eb" FOREIGN KEY ("gamePlayerId") REFERENCES "gamePlayers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gamePlayerAnswers" ADD CONSTRAINT "FK_5655397a76446b20753151aa5d8" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gamePlayers" ADD CONSTRAINT "FK_abf88448d7c61c70366c122c7c4" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gamePlayers" ADD CONSTRAINT "FK_e3ab17bd53416b4705522880503" FOREIGN KEY ("gameId") REFERENCES "quizGames"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "gamePlayers" DROP CONSTRAINT "FK_e3ab17bd53416b4705522880503"`);
        await queryRunner.query(`ALTER TABLE "gamePlayers" DROP CONSTRAINT "FK_abf88448d7c61c70366c122c7c4"`);
        await queryRunner.query(`ALTER TABLE "gamePlayerAnswers" DROP CONSTRAINT "FK_5655397a76446b20753151aa5d8"`);
        await queryRunner.query(`ALTER TABLE "gamePlayerAnswers" DROP CONSTRAINT "FK_97a4777d3de53cbefe8159043eb"`);
        await queryRunner.query(`ALTER TABLE "gamePlayerAnswers" DROP COLUMN "questionId"`);
        await queryRunner.query(`ALTER TABLE "gamePlayerAnswers" ADD "questionId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "gamePlayerAnswers" ALTER COLUMN "gamePlayerId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "gamePlayerAnswers" ADD CONSTRAINT "FK_97a4777d3de53cbefe8159043eb" FOREIGN KEY ("gamePlayerId") REFERENCES "gamePlayers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gamePlayers" DROP COLUMN "gameId"`);
        await queryRunner.query(`ALTER TABLE "gamePlayers" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "gamePlayers" ADD "game_id" uuid`);
        await queryRunner.query(`ALTER TABLE "gamePlayers" ADD "user_id" uuid`);
        await queryRunner.query(`ALTER TABLE "gamePlayers" ADD CONSTRAINT "FK_9f5390391303ad9c1e7c6f1960d" FOREIGN KEY ("game_id") REFERENCES "quizGames"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gamePlayers" ADD CONSTRAINT "FK_8ccb1b7edf5dd41de7fcd960146" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
