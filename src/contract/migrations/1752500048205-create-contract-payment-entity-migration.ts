import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateContractPaymentEntityMigration1752500048205
  implements MigrationInterface
{
  name = 'CreateContractPaymentEntityMigration1752500048205';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."contract_payment_payment_method_enum" AS ENUM('zelle', 'mobile_payment', 'bank_transfer', 'cash')`,
    );
    await queryRunner.query(
      `CREATE TABLE "contract_payment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "payment_method" "public"."contract_payment_payment_method_enum", "reference_number" integer, "photo" text, "owner" character varying, "due_date" TIMESTAMP NOT NULL, "amount_paid" numeric(10,2) NOT NULL, "paid_at" TIMESTAMP, "contract_id" uuid, CONSTRAINT "PK_ec4b471fec3378be1b924804a7a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_payment" ADD CONSTRAINT "FK_7f362463433cf5ddce567dbe0f1" FOREIGN KEY ("contract_id") REFERENCES "contract"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contract_payment" DROP CONSTRAINT "FK_7f362463433cf5ddce567dbe0f1"`,
    );
    await queryRunner.query(`DROP TABLE "contract_payment"`);
    await queryRunner.query(
      `DROP TYPE "public"."contract_payment_payment_method_enum"`,
    );
  }
}
