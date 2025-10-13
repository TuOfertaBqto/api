import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInstallmentPaymentEntityMigration1759617650008
  implements MigrationInterface
{
  name = 'CreateInstallmentPaymentEntityMigration1759617650008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "installment_payment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "amount" numeric(10,2) NOT NULL, "installment_id" uuid, "payment_id" uuid, CONSTRAINT "PK_0890c88140eec3e00868d2e8174" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "installment_payment" ADD CONSTRAINT "FK_8d249690d3e7f4edd7b78998ca3" FOREIGN KEY ("installment_id") REFERENCES "installment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "installment_payment" ADD CONSTRAINT "FK_6ec5cf059220a4e1af9afb1527e" FOREIGN KEY ("payment_id") REFERENCES "payment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "installment_payment" DROP CONSTRAINT "FK_6ec5cf059220a4e1af9afb1527e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "installment_payment" DROP CONSTRAINT "FK_8d249690d3e7f4edd7b78998ca3"`,
    );
    await queryRunner.query(`DROP TABLE "installment_payment"`);
  }
}
