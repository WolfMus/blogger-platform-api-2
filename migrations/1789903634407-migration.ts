import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1789903634407 implements MigrationInterface {
    name = 'Migration1789903634407'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."quizGames_status_enum" AS ENUM('PendingSecondPlayer', 'Active', 'Finished')`);
        await queryRunner.query(`CREATE TABLE "quizGames" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."quizGames_status_enum" NOT NULL DEFAULT 'PendingSecondPlayer', "questionIds" uuid array, "pairCreatedDate" TIMESTAMP NOT NULL DEFAULT now(), "startGameDate" TIMESTAMP WITH TIME ZONE, "finishGameDate" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_e6698e6203278a780f384119cdc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "gamePlayers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "score" smallint NOT NULL DEFAULT '0', "user_id" uuid, "game_id" uuid, CONSTRAINT "PK_6a671ba672a85bf303fe52b8dd3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."gamePlayerAnswers_status_enum" AS ENUM('Correct', 'Incorrect')`);
        await queryRunner.query(`CREATE TABLE "gamePlayerAnswers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."gamePlayerAnswers_status_enum" NOT NULL, "addedAt" TIMESTAMP NOT NULL DEFAULT now(), "questionId" character varying NOT NULL, "gamePlayerId" uuid, CONSTRAINT "PK_ef7403de1b689ac3a51d5095258" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "questions" DROP CONSTRAINT "PK_08a6d4b0f49ff300bf3a0ca60ac"`);
        await queryRunner.query(`ALTER TABLE "questions" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "questions" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "questions" ADD CONSTRAINT "PK_08a6d4b0f49ff300bf3a0ca60ac" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "gamePlayers" ADD CONSTRAINT "FK_8ccb1b7edf5dd41de7fcd960146" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gamePlayers" ADD CONSTRAINT "FK_9f5390391303ad9c1e7c6f1960d" FOREIGN KEY ("game_id") REFERENCES "quizGames"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gamePlayerAnswers" ADD CONSTRAINT "FK_97a4777d3de53cbefe8159043eb" FOREIGN KEY ("gamePlayerId") REFERENCES "gamePlayers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "gamePlayerAnswers" DROP CONSTRAINT "FK_97a4777d3de53cbefe8159043eb"`);
        await queryRunner.query(`ALTER TABLE "gamePlayers" DROP CONSTRAINT "FK_9f5390391303ad9c1e7c6f1960d"`);
        await queryRunner.query(`ALTER TABLE "gamePlayers" DROP CONSTRAINT "FK_8ccb1b7edf5dd41de7fcd960146"`);
        await queryRunner.query(`ALTER TABLE "questions" DROP CONSTRAINT "PK_08a6d4b0f49ff300bf3a0ca60ac"`);
        await queryRunner.query(`ALTER TABLE "questions" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "questions" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "questions" ADD CONSTRAINT "PK_08a6d4b0f49ff300bf3a0ca60ac" PRIMARY KEY ("id")`);
        await queryRunner.query(`DROP TABLE "gamePlayerAnswers"`);
        await queryRunner.query(`DROP TYPE "public"."gamePlayerAnswers_status_enum"`);
        await queryRunner.query(`DROP TABLE "gamePlayers"`);
        await queryRunner.query(`DROP TABLE "quizGames"`);
        await queryRunner.query(`DROP TYPE "public"."quizGames_status_enum"`);
    }

}
