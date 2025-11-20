import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePaymentAccountMigration1763646303626
  implements MigrationInterface
{
  name = 'CreatePaymentAccountMigration1763646303626';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "payment_account" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "payment_id" uuid, "account_id" uuid, CONSTRAINT "REL_a63338f001b14f35272cdf9683" UNIQUE ("payment_id"), CONSTRAINT "PK_bb95477ae48c741a9c1445babfd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_account" ADD CONSTRAINT "FK_a63338f001b14f35272cdf96833" FOREIGN KEY ("payment_id") REFERENCES "payment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_account" ADD CONSTRAINT "FK_e730e12d1775d3c2d15920ea902" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment_account" DROP CONSTRAINT "FK_e730e12d1775d3c2d15920ea902"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_account" DROP CONSTRAINT "FK_a63338f001b14f35272cdf96833"`,
    );
    await queryRunner.query(`DROP TABLE "payment_account"`);
  }
}
