import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserEntityMigration1751570392511
  implements MigrationInterface
{
  name = 'CreateUserEntityMigration1751570392511';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_role_enum" AS ENUM('main', 'super_admin', 'admin', 'vendor', 'customer')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "code" character varying NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "document_id" character varying NOT NULL, "email" character varying NOT NULL, "phone_number" character varying, "password" character varying NOT NULL, "adress" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL DEFAULT 'customer', CONSTRAINT "UQ_c5f78ad8f82e492c25d07f047a5" UNIQUE ("code"), CONSTRAINT "UQ_18a41ed5aafb9732cfa62c8debd" UNIQUE ("document_id"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
  }
}
