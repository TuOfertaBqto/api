import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEmailTemplateMigration1756315952745
  implements MigrationInterface
{
  name = 'CreateEmailTemplateMigration1756315952745';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "email_template" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "html" text NOT NULL, "text" text NOT NULL, CONSTRAINT "UQ_274708db64fcce5448f2c4541c7" UNIQUE ("name"), CONSTRAINT "PK_c90815fd4ca9119f19462207710" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "email_template"`);
  }
}
