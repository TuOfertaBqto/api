import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePaymentEntityMigration1759502380441
  implements MigrationInterface
{
  name = 'CreatePaymentEntityMigration1759502380441';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."payment_type_enum" AS ENUM('zelle', 'paypal', 'binance', 'mobile_payment', 'bank_transfer', 'cash', 'discount')`,
    );
    await queryRunner.query(
      `CREATE TABLE "payment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "type" "public"."payment_type_enum", "reference_number" integer, "photo" text, "owner" character varying, "amount" numeric(10,2) NOT NULL, "paid_at" TIMESTAMP NOT NULL, CONSTRAINT "PK_fcaec7df5adf9cac408c686b2ab" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "payment"`);
    await queryRunner.query(`DROP TYPE "public"."payment_type_enum"`);
  }
}
